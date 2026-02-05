import pandas as pd
from .config import MLConfig

def load_model(path: str = MLConfig.MODEL_PATH):
    """
    Load the trained model from disk.
    """
    # return joblib.load(path)
    return None

def predict_demand(model, input_data: pd.DataFrame):
    """
    Generate sales forecasts using the trained model.
    """
    # predictions = model.predict(input_data)
    # return predictions
    return []
