import pandas as pd
from .model import forecaster
from typing import List, Dict, Optional

def load_model():
    """
    Ensure the singleton model is loaded.
    """
    return forecaster.load_model()

def predict_demand(days: int = 30, future_promotions: Optional[List[int]] = None, include_history: bool = False) -> List[Dict]:
    """
    Generate sales forecasts using the trained singleton model.
    """
    if not forecaster.is_trained:
        if not load_model():
            return {"error": "Model not trained or found"}
            
    return forecaster.predict(days=days, include_history=include_history, future_promotions=future_promotions)
    
def get_components(days: int = 30) -> Dict:
    """
    Get trend and seasonality components.
    """
    return forecaster.get_model_components(days=days)

