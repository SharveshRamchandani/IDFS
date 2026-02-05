from app.db.session import SessionLocal
from app.crud import crud_holiday
from sqlalchemy.orm import Session

def train_model(csv_path: str = "data/train.csv", auto_tune: bool = False):
    """
    Train the machine learning model using the singleton forecaster.
    Returns the evaluation metrics.
    """
    print("🚀 Starting Model Training Pipeline...")
    
    # 1. Fetch Holidays from DB
    holidays_df = None
    try:
        db = SessionLocal()
        holidays = crud_holiday.get_all_holidays(db)
        if holidays:
            # Convert to Prophet format: ds, holiday
            data = []
            for h in holidays:
                data.append({
                    "ds": h.date,
                    "holiday": h.description,
                    "lower_window": 0,
                    "upper_window": 1 if h.transferred else 0, # Example logic
                })
            holidays_df = pd.DataFrame(data)
            print(f"🎉 Loaded {len(holidays_df)} holidays from Database.")
        db.close()
    except Exception as e:
        print(f"⚠️ Failed to load holidays from DB: {e}")

    # Train
    forecaster.train(csv_path=csv_path, auto_tune=auto_tune, holidays_df=holidays_df)
    
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

