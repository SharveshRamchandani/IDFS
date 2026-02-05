import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error

def evaluate_model(y_true, y_pred):
    """
    Calculate performance metrics.
    """
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = mean_absolute_error(y_true, y_pred)
    
    # Calculate MAPE (Mean Absolute Percentage Error)
    # Avoid division by zero by adding a small epsilon
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero = y_true != 0
    mape = np.mean(np.abs((y_true[non_zero] - y_pred[non_zero]) / y_true[non_zero])) * 100
    
    return {
        "RMSE": rmse,
        "MAE": mae,
        "MAPE": f"{mape:.2f}%"
    }
