import pandas as pd
import numpy as np

class ChurnFeatureRegistry:
    """
    Centralized Feature Store logic.
    Ensures that raw API data (salary_band, avg_balance) and raw DB data 
    are identically transformed into the exact columns expected by the ML Pipeline
    (EstimatedSalary, Balance, etc.) to eliminate Training-Serving Skew.
    """
    @staticmethod
    def map_raw_to_features(df_raw: pd.DataFrame) -> pd.DataFrame:
        df = df_raw.copy()
        
        # 1. Map column names if they come from the API/DB schema
        rename_map = {
            "age": "Age",
            "tenure_months": "Tenure",
            "avg_balance": "Balance",
            "num_products": "NumOfProducts",
            "has_credit_card": "HasCrCard",
            "is_active_member": "IsActiveMember",
            "geography": "Geography",
            "gender": "Gender",
            "credit_score": "CreditScore",
            "customer_id": "CustomerId"
        }
        df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})

        # 2. Centralized Salary Band to EstimatedSalary logic
        # (This replaces the scattered ad-hoc if/else statements in predict.py)
        if "salary_band" in df.columns and "EstimatedSalary" not in df.columns:
            def band_to_salary(band):
                if band == "low": return 40000.0
                elif band == "mid": return 75000.0
                elif band == "high": return 125000.0
                elif band == "ultra-high": return 200000.0
                return 100000.0 # default
            df["EstimatedSalary"] = df["salary_band"].apply(band_to_salary)
            
        # 3. Ensure defaults for pipeline required columns
        if "Geography" not in df.columns: df["Geography"] = "Unknown"
        if "Gender" not in df.columns: df["Gender"] = "Unknown"
        if "CreditScore" not in df.columns: df["CreditScore"] = 650.0
            
        return df
