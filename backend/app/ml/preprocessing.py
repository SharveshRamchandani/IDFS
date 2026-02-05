import pandas as pd
import numpy as np
from typing import List, Tuple

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Basic data cleaning: handling missing values, standardizing formats.
    """
    df = df.copy()
    
    # Drop duplicates
    if df.duplicated().sum() > 0:
        df = df.drop_duplicates()
        
    # Handle missing values - simple forward fill for time series nature, then 0
    df = df.ffill().fillna(0)
    
    return df

def rename_columns(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardize column names for Prophet (ds, y) and auxiliary columns.
    """
    df = df.copy()
    
    # Handle Kaggle Schema (date, unit_sales) -> (ds, y)
    if 'unit_sales' in df.columns:
        df = df.rename(columns={'unit_sales': 'quantity'})
        
    if 'date' in df.columns:
        df = df.rename(columns={'date': 'ds'})
        
    if 'quantity' in df.columns:
        df = df.rename(columns={'quantity': 'y'})
        
    return df

def remove_outliers(df: pd.DataFrame, column: str = 'y', lower_quantile: float = 0.01, upper_quantile: float = 0.99) -> pd.DataFrame:
    """
    Cap outliers based on quantiles.
    """
    if column not in df.columns:
        return df
        
    lower_limit = df[column].quantile(lower_quantile)
    upper_limit = df[column].quantile(upper_quantile)
    
    df[column] = np.clip(df[column], lower_limit, upper_limit)
    return df

def feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """
    Create features and standardize for Prophet.
    """
    df = rename_columns(df)
    
    if 'ds' not in df.columns or 'y' not in df.columns:
        return df # Return as is if critical columns are missing, let validation handle it
        
    df['ds'] = pd.to_datetime(df['ds'])
    
    # Aggregate by date if multiple entries exist
    # Sum 'y', mean/mode for others if needed. For now simple sum for y.
    agg_dict = {'y': 'sum'}
    if 'onpromotion' in df.columns:
        agg_dict['onpromotion'] = 'max' # If any item is on promotion, the day is flagged (or sum, depending on logic. Max is safer for binary)
        
    df = df.groupby('ds').agg(agg_dict).reset_index()
    
    return df

def prepare_for_training(df: pd.DataFrame) -> pd.DataFrame:
    """
    Full pipeline for training preparation.
    """
    df = clean_data(df)
    df = feature_engineering(df)
    df = remove_outliers(df)
    return df
 
