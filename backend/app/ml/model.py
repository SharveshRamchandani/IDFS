import pandas as pd
import numpy as np
from prophet import Prophet
import joblib
import os
from datetime import datetime, timedelta
import logging

# Setup logging
logging.getLogger('prophet').setLevel(logging.WARNING)

class ForecastModel:
    def __init__(self, model_path="prophet_model.joblib"):
        self.model_path = model_path
        self.model = None
        self.is_trained = False
        
    def prepare_data(self, df):
        """
        Prophet strictly requires columns named 'ds' (date) and 'y' (value).
        This function maps your database schema or Kaggle dataset to Prophet's format.
        """
        df = df.copy()
        
        # Handle Kaggle Schema (date, store_nbr, item_nbr, unit_sales, onpromotion)
        if 'unit_sales' in df.columns:
            df = df.rename(columns={'unit_sales': 'quantity'})
        
        # Renaissance mapping: 'date' -> 'ds', 'quantity' -> 'y'
        if 'date' in df.columns and 'quantity' in df.columns:
            df = df.rename(columns={'date': 'ds', 'quantity': 'y'})
        else:
            # If columns are missing, log a warning and return empty DF to avoid crash
            print(f"⚠️ Dataframe missing required columns. Available: {df.columns.tolist()}")
            return pd.DataFrame(columns=['ds', 'y'])

        df['ds'] = pd.to_datetime(df['ds'])
        
        # Aggregate if multiple entries per date exist (e.g., sales across multiple stores)
        # Prophet expects one value per timestamp for a single time series.
        # This sums up ALL sales for the period.
        df = df.groupby('ds')['y'].sum().reset_index()
        
        return df

    def train(self, df=None, csv_path="data/train.csv"):
        """
        Trains the Prophet model.
        1. Checks if 'df' argument is passed.
        2. If not, checks if 'csv_path' exists and loads it.
        3. If neither, fallback to dummy data.
        """
        if df is None:
            # Check if the CSV file exists in the specific path
            if os.path.exists(csv_path):
                print(f"📂 Found CSV file. Loading data from {csv_path}...")
                try:
                    df = pd.read_csv(csv_path)
                    
                    # Basic validation before proceeding
                    if 'date' not in df.columns or ('quantity' not in df.columns and 'unit_sales' not in df.columns):
                        print(f"⚠️ CSV found but missing required columns ('date', 'quantity'/'unit_sales'). Columns found: {df.columns.tolist()}")
                        print("⚠️ Falling back to synthetic training data...")
                        df = self._generate_dummy_data()

                except Exception as e:
                    print(f"❌ Error reading CSV: {e}")
                    return
            else:
                print(f"⚠️ File not found at {csv_path}. Generating synthetic training data...")
                df = self._generate_dummy_data()

        print(f"🔄 Preparing {len(df)} records for training...")
        train_df = self.prepare_data(df)

        # Initialize Prophet with retail-specific tuning
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative' 
        )

        self.model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        self.model.add_country_holidays(country_name='US') 

        if 'onpromotion' in train_df.columns:
            self.model.add_regressor('onpromotion')

        print("🚀 Fitting Prophet model...")
        self.model.fit(train_df)
        self.is_trained = True
        
        self.save_model()
        print("✅ Model trained and saved successfully.")

    def predict(self, days=30, include_history=False, future_promotions=None):
        """
        Generates forecasts for the next 'days'.
        future_promotions: Optional list or Series of 0/1 for future dates.
        """
        if not self.is_trained or self.model is None:
            if not self.load_model():
                raise ValueError("Model has not been trained yet.")

        # Create future dataframe
        future = self.model.make_future_dataframe(periods=days)

        # Handle future regressors (Promotions)
        if 'onpromotion' in self.model.extra_regressors:
            if future_promotions is None:
                # Default: Assume no promotions in future if not specified
                future['onpromotion'] = 0
            else:
                # Ensure length matches
                # This is a simplified logic; in prod you'd join on date
                future['onpromotion'] = 0 
                # future.loc[future_dates, 'onpromotion'] = 1 (Implementation depends on input)

        forecast = self.model.predict(future)
        
        # Extract clean results
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
        
        if not include_history:
            # Filter only future dates
            last_history_date = self.model.history['ds'].max()
            result = result[result['ds'] > last_history_date]

        return result.to_dict(orient='records')

    def _generate_dummy_data(self):
        """Generates realistic dummy retail data for testing"""
        dates = pd.date_range(start='2022-01-01', end='2024-01-01', freq='D')
        data = []
        for date in dates:
            # Base logic: Weekends higher, Dec higher
            base = 100
            if date.weekday() >= 5: base += 50
            if date.month == 12: base += 80
            
            # Add some randomness
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