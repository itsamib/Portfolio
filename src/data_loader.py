import streamlit as st
import pandas as pd


@st.cache_data
def load_data(uploaded_file):
    """
    Read CSV or Excel file and return a DataFrame.
    
    Args:
        uploaded_file: A Streamlit uploaded file object.
        
    Returns:
        DataFrame if successful, None if file is None or an error occurs.
    """
    if uploaded_file is None:
        return None
    
    filename = uploaded_file.name.lower()
    
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(uploaded_file)
        elif filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(uploaded_file)
        else:
            st.error("Unsupported file format. Please upload a CSV or Excel file.")
            return None
    except Exception as e:
        st.error(f"Error reading file: {e}")
        return None
    
    return df


def validate_columns(df):
    """
    Check that required columns exist in the DataFrame.
    
    Args:
        df: DataFrame to validate.
        
    Returns:
        True if all required columns are present, False otherwise.
    """
    required = {"Date", "Account_ID", "Portfolio_Value", "Cash_Balance", "Net_Cash_Flow"}
    missing = required - set(df.columns)
    
    if missing:
        st.error(f"Missing columns: {missing}")
        return False
    
    return True
