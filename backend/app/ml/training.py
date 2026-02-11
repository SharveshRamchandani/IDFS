import pandas as pd
from app.db.session import SessionLocal
from app.crud import crud_holiday
from sqlalchemy.orm import Session
from app.ml.model import forecaster

def train_model(csv_path: str = "data/train.csv", auto_tune: bool = False):
    """
    Train the machine learning model using the singleton forecaster.
    Returns the evaluation metrics.
    """
    print("🚀 Starting Model Training Pipeline...")
    
    db = SessionLocal()
    
    # 1. Fetch Holidays from DB
    holidays_df_final = None
    try:
        from app.crud import crud_holiday
        holidays_list = crud_holiday.get_all_holidays(db)
        if holidays_list:
            data = []
            for h in holidays_list:
                data.append({
                    "ds": h.date,
                    "holiday": h.description,
                    "lower_window": 0,
                    "upper_window": 1, 
                })
            holidays_df_final = pd.DataFrame(data)
            print(f"🎉 Loaded {len(holidays_df_final)} holidays from Database.")
    except Exception as e:
        print(f"⚠️ Failed to load holidays from DB: {e}")

    # 2. Fetch Sales Data from DB
    df_train = None
    try:
        print("📊 Fetching Sales Data from Database...")
        from app.models.sales import SalesData
        sales_query = db.query(SalesData.date, SalesData.quantity, SalesData.onpromotion).all()
        
        if sales_query:
            # Convert to DataFrame
            data = [{"ds": s.date, "y": s.quantity, "onpromotion": 1 if s.onpromotion else 0} for s in sales_query]
            df_train = pd.DataFrame(data)
            print(f"✅ Loaded {len(df_train)} sales records from Database.")
        else:
            print("⚠️ No sales data in DB. Falling back to CSV/Synthetic.")
    except Exception as e:
        print(f"❌ Error fetching sales data: {e}")
    finally:
        db.close()

    # Train (pass df_train if available, else None and let forecaster use CSV)
    forecaster.train(df=df_train, csv_path=csv_path, auto_tune=auto_tune, holidays_df=holidays_df_final)
    
    # Evaluate if trained successfully
    metrics = None
    if forecaster.is_trained:
        print("📊 Evaluating model performance...")
        metrics = forecaster.evaluate()
        
    return metrics

def save_model():
    """
    Save the trained model to disk.
    """
    if forecaster.is_trained:
        forecaster.save_model()
        print(f"✅ Model saved to {forecaster.model_path}")
    else:
        print("⚠️ Model is not trained. Nothing to save.")

