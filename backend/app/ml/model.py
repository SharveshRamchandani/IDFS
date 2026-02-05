import pandas as pd
import numpy as np
from prophet import Prophet
from prophet.diagnostics import cross_validation, performance_metrics
import joblib
import os
from datetime import datetime, timedelta
import logging
from .preprocessing import prepare_for_training

# Setup logging
logging.getLogger('prophet').setLevel(logging.WARNING)

class ForecastModel:
    def __init__(self, model_path="prophet_model.joblib", 
                 changepoint_prior_scale=0.05, 
                 seasonality_prior_scale=10.0,
                 holidays_prior_scale=10.0,
                 seasonality_mode='multiplicative',
                 daily_seasonality=False,
                 weekly_seasonality=True,
                 yearly_seasonality=True,
                 country_holidays='US'):
        self.model_path = model_path
        self.model = None
        self.is_trained = False
        
        # Hyperparameters
        self.params = {
            'changepoint_prior_scale': changepoint_prior_scale,
            'seasonality_prior_scale': seasonality_prior_scale,
            'holidays_prior_scale': holidays_prior_scale,
            'seasonality_mode': seasonality_mode,
            'daily_seasonality': daily_seasonality,
            'weekly_seasonality': weekly_seasonality,
            'yearly_seasonality': yearly_seasonality
        }
        self.country_holidays = country_holidays
        self.last_metrics = None

    def train(self, df=None, csv_path="data/train.csv", auto_tune=False, holidays_df=None):
        """
        Trains the Prophet model with sophisticated preprocessing and configuration.
        auto_tune: If True, runs grid search to find best hyperparameters. (Slow!)
        holidays_df: Optional DataFrame of custom holidays (ds, holiday, [lower_window, upper_window])
        """
        if df is None:
            if os.path.exists(csv_path):
                print(f"📂 Found CSV file. Loading data from {csv_path}...")
                try:
                    df = pd.read_csv(csv_path)
                except Exception as e:
                    print(f"❌ Error reading CSV: {e}")
                    return
            else:
                print(f"⚠️ File not found at {csv_path}. Generating synthetic training data...")
                df = self._generate_dummy_data()

        print(f"🔄 Preparing {len(df)} records for training...")
        
        # Use centralized preprocessing
        train_df = prepare_for_training(df)
        
        if train_df.empty or 'y' not in train_df.columns or 'ds' not in train_df.columns:
            print("❌ Preprocessing failed or missing required columns ('ds', 'y').")
            return

        # Auto-Tune if requested
        if auto_tune:
            print("🧠 Auto-Tuning enabled. This may take a while...")
            self.optimize_hyperparameters(df)
            print(f"🧠 Optimization done. using params: {self.params}")

        # Initialize Prophet with tuned parameters
        # Pass holidays if available
        self.model = Prophet(holidays=holidays_df, **self.params)

        # detailed seasonality
        self.model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        
        if self.country_holidays:
            try:
                self.model.add_country_holidays(country_name=self.country_holidays)
            except Exception as e:
                print(f"⚠️ Could not add holidays for {self.country_holidays}: {e}")

        if 'onpromotion' in train_df.columns:
            self.model.add_regressor('onpromotion')

        print("🚀 Fitting Prophet model...")
        self.model.fit(train_df)
        self.is_trained = True
        
        self.save_model()
        print("✅ Model trained and saved successfully.")

    def evaluate(self, initial='365 days', period='30 days', horizon='30 days'):
        """
        Perform cross-validation to evaluate model performance (RMSE, MAE).
        """
        if not self.is_trained:
            print("⚠️ Model not trained. Cannot evaluate.")
            return None

        print("📊 Starting Cross-Validation...")
        try:
            df_cv = cross_validation(self.model, initial=initial, period=period, horizon=horizon)
            df_p = performance_metrics(df_cv)
            
            # Save metrics
            metrics = df_p.mean().to_dict()
            self.last_metrics = metrics
            
            print(f"✅ Evaluation Complete. RMSE: {metrics.get('rmse', 'N/A'):.2f}, MAE: {metrics.get('mae', 'N/A'):.2f}")
            return metrics
        except Exception as e:
            print(f"❌ Cross-validation failed (possibly not enough data): {e}")
            return None

    def predict(self, days=30, include_history=False, future_promotions=None):
        """
        Generates forecasts for the next 'days'.
        """
        if not self.is_trained or self.model is None:
            if not self.load_model():
                raise ValueError("Model has not been trained yet.")

        future = self.model.make_future_dataframe(periods=days)

        if 'onpromotion' in self.model.extra_regressors:
            if future_promotions is None:
                future['onpromotion'] = 0
            else:
                # Simplified: assuming future_promotions aligns or default to 0
                future['onpromotion'] = 0 

        forecast = self.model.predict(future)
        
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
        
        if not include_history:
            last_history_date = self.model.history['ds'].max()
            result = result[result['ds'] > last_history_date]

        return result.to_dict(orient='records')

    def get_model_components(self, days=30):
        """
        Returns the decomposition of the forecast (trend, seasonality) for visualization.
        """
        if not self.is_trained or self.model is None:
            if not self.load_model():
                return None
        
        future = self.model.make_future_dataframe(periods=days)
        if 'onpromotion' in self.model.extra_regressors:
            future['onpromotion'] = 0
            
        forecast = self.model.predict(future)
        
        # Extract components if they exist in the forecast dataframe
        components = {}
        if 'trend' in forecast.columns:
            components['trend'] = forecast[['ds', 'trend']].to_dict(orient='records')
        
        if 'yearly' in forecast.columns:
            components['yearly'] = forecast[['ds', 'yearly']].to_dict(orient='records')
            
        if 'weekly' in forecast.columns:
            components['weekly'] = forecast[['ds', 'weekly']].to_dict(orient='records')
            
        return components

    def detect_anomalies(self, threshold=1.0):
        """
        Detects historical anomalies where actual values fell significantly outside the uncertainty intervals.
        threshold: Multiplier for the uncertainty interval (1.0 = standard bounds).
        """
        if not self.is_trained:
            return []
            
        # Predict on history
        forecast = self.model.predict(self.model.history)
        history = self.model.history.copy()
        
        # Merge forecast with actual history
        merged = pd.merge(history, forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']], on='ds')
        
        # Calculate deviation
        merged['error'] = merged['y'] - merged['yhat']
        merged['uncertainty'] = merged['yhat_upper'] - merged['yhat_lower']
        
        # Flag anomalies
        # Anomaly if outside the (Lower - padding, Upper + padding) ?
        # Prophet 'yhat_lower' and 'yhat_upper' are usually 80% interval.
        # We check if actual 'y' is outside these bounds * threshold factor.
        
        # Simple logic: If y > yhat_upper or y < yhat_lower
        anomalies = []
        for _, row in merged.iterrows():
            is_anomaly = False
            comment = ""
            
            if row['y'] > row['yhat_upper']:
                is_anomaly = True
                comment = "Unexpected Spike"
            elif row['y'] < row['yhat_lower']:
                is_anomaly = True
                comment = "Unexpected Drop"
                
            if is_anomaly:
                anomalies.append({
                    "date": row['ds'].strftime("%Y-%m-%d"),
                    "actual": row['y'],
                    "expected": row['yhat'],
                    "lower_bound": row['yhat_lower'],
                    "upper_bound": row['yhat_upper'],
                    "type": comment
                })
                
        return anomalies

    def simulate_scenario(self, days=30, promotion_schedule=None):
        """
        Simulates a forecast scenario based on a hypothetical promotion schedule.
        This allows 'What-If' analysis: "What if we run a promotion next week?"
        
        promotion_schedule: List of 0/1 values for the next 'days'.
        """
        if not self.is_trained or self.model is None:
            if not self.load_model():
                return None
                
        future = self.model.make_future_dataframe(periods=days)
        
        # Validate schedule
        if not promotion_schedule:
            promotion_schedule = [0] * days
        
        # Ensure schedule length matches 'days'
        if len(promotion_schedule) < days:
            promotion_schedule += [0] * (days - len(promotion_schedule))
        promotion_schedule = promotion_schedule[:days]
            
        # We need to construct the full regressor column for 'future' dataframe
        # future includes history + 'periods' days
        history_len = len(self.model.history)
        total_len = len(future)
        
        # If 'onpromotion' is used
        if 'onpromotion' in self.model.extra_regressors:
            # We assume historical promotions are 0 for this simulation or retrieve them?
            # Better: retrieve historical average or 0. For simulation, 0 is safe baseline for history if unknown.
            # Ideally we'd use self.model.history['onpromotion'] but Prophet history frame might not keep regressors cleanly accessible without re-merging.
            # Simplified approach: Set history to 0, or try to respect pattern.
            
            # Create a full array
            full_promotion = [0] * history_len + promotion_schedule
            future['onpromotion'] = full_promotion
            
        forecast = self.model.predict(future)
        
        # Return only the future part
        future_forecast = forecast.tail(days)
        
        return future_forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict(orient='records')

    def optimize_hyperparameters(self, df, param_grid=None):
        """
        Auto-tune hyperparameters using Grid Search with Cross Validation.
        Warning: This is computationally expensive.
        """
        from sklearn.model_selection import ParameterGrid
        
        if param_grid is None:
            param_grid = {  
                'changepoint_prior_scale': [0.001, 0.01, 0.1, 0.5],
                'seasonality_prior_scale': [0.01, 0.1, 1.0, 10.0],
                'holidays_prior_scale': [0.01, 0.1, 1.0, 10.0],
                'seasonality_mode': ['additive', 'multiplicative'],
            }

        print(f"🔧 Starting Hyperparameter Tuning over {len(list(ParameterGrid(param_grid)))} combinations...")
        
        best_params = self.params
        min_rmse = float('inf')
        
        # Prepare data once
        train_df = prepare_for_training(df)
        
        for params in ParameterGrid(param_grid):
            try:
                m = Prophet(**params)
                if self.country_holidays:
                    m.add_country_holidays(country_name=self.country_holidays)
                if 'onpromotion' in train_df.columns:
                    m.add_regressor('onpromotion')
                    
                m.fit(train_df)
                
                # Fast CV: shorter horizon for speed during tuning
                df_cv = cross_validation(m, initial='365 days', period='90 days', horizon='30 days', parallel="processes")
                df_p = performance_metrics(df_cv)
                rmse = df_p['rmse'].mean()
                
                if rmse < min_rmse:
                    min_rmse = rmse
                    best_params = params
                    print(f"📈 New Best Params: {params} (RMSE: {rmse:.2f})")
                    
            except Exception as e:
                print(f"⚠️ Tuning failed for {params}: {e}")
                
        print(f"✅ Optimization Complete. Best RMSE: {min_rmse:.2f}")
        self.params.update(best_params)
        return best_params

    def get_feature_importance(self):
        """
        Extracts coefficients to understand the impact of regressors (promotions, holidays).
        Interpretable Machine Learning: "How much did X contribute to Y?"
        """
        if not self.is_trained or self.model is None:
            return {}
            
        importance = {}
        
        # 1. Regressors (e.g. 'onpromotion')
        from prophet.utilities import regressor_coefficients
        try:
            reg_coeffs = regressor_coefficients(self.model)
            # coef is the impact. For binary regressors, it's the absolute impact.
            # We convert to a simpler dict
            for index, row in reg_coeffs.iterrows():
                importance[row['regressor']] = {
                    "coefficient": row['coef'],
                    "impact_description": f"Adds {row['coef']:.2f} to baseline" if row['mode'] == 'additive' else f"Multiplies baseline by {row['coef']:.2f}%"
                }
        except Exception as e:
            print(f"⚠️ Could not extract regressor coefficients: {e}")
            
        # 2. Seasonality Magnitude
        # Compare max-min of seasonal components to see relative strength
        # (This implies running a prediction to see the range)
        
        return importance


    def _generate_dummy_data(self):
        """Generates realistic dummy retail data for testing"""
        dates = pd.date_range(start='2022-01-01', end='2024-01-01', freq='D')
        data = []
        for date in dates:
            base = 100
            if date.weekday() >= 5: base += 50
            if date.month == 12: base += 80
            noise = np.random.randint(-20, 20)
            qty = max(0, base + noise)
            data.append({
                'date': date,
                'quantity': qty,
                'onpromotion': 1 if np.random.random() > 0.9 else 0
            })
        return pd.DataFrame(data)

    def save_model(self):
        joblib.dump(self.model, self.model_path)
    
    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.is_trained = True
            return True
        return False

# Singleton instance
forecaster = ForecastModel()
