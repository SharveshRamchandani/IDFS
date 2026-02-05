import pandas as pd
from typing import List

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Basic data cleaning: handling missing values, standardizing formats.
    """
    # Placeholder for data cleaning logic
    return df

def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create features: date parts, lag features, moving averages.
    """
    # Placeholder for feature engineering logic
    # e.g., df['month'] = df['date'].dt.month
    return df

def prepare_for_training(df: pd.DataFrame):
    """
    Final preparation steps specifically for training (X/y split).
    """
    # Placeholder
    return df, df 
