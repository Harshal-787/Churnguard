"""
ChurnGuard - Shared Inference Utilities
------------------------------------------------------------
Single source of truth for turning raw customer rows into
churn probabilities. Used by the API, the SHAP explainer, and
the dashboard so scaling/feature logic never drifts between them.
"""

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import __main__

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from ml.features.build_features import FintechFeatureEngineer
# Inject the RatioFeatureEngineer alias into __main__ so that models trained in notebooks can be unpickled
if not hasattr(__main__, 'RatioFeatureEngineer'):
    setattr(__main__, 'RatioFeatureEngineer', FintechFeatureEngineer)
sys.path.append(str(ROOT))

MODEL_DIR = ROOT / "saved_models"

class ChurnPredictor:
    def __init__(self, model_filename: str = "churn_pipeline.joblib"):
        model_path = MODEL_DIR / model_filename
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        self.pipeline = joblib.load(model_path)
        
        if not hasattr(self.pipeline, "named_steps"):
            self.is_legacy = True
            try:
                self.feature_columns = joblib.load(MODEL_DIR / "feature_columns.joblib")
            except:
                self.feature_columns = None
        else:
            self.is_legacy = False
            # Patch OneHotEncoders to handle unknown categories gracefully
            for step_name, step_obj in self.pipeline.named_steps.items():
                if hasattr(step_obj, "transformers_"):
                    for name, trans, cols in step_obj.transformers_:
                        if hasattr(trans, "named_steps"):
                            for sub_name, sub_trans in trans.named_steps.items():
                                if type(sub_trans).__name__ == "OneHotEncoder":
                                    sub_trans.handle_unknown = "ignore"
                        elif type(trans).__name__ == "OneHotEncoder":
                            trans.handle_unknown = "ignore"

    def predict_proba(self, df_raw: pd.DataFrame) -> np.ndarray:
        if getattr(self, "is_legacy", False) and getattr(self, "feature_columns", None) is not None:
            df = df_raw.copy()
            # Manual engineering for legacy
            if "Balance" in df.columns and "EstimatedSalary" in df.columns:
                df["Balance_Salary_Ratio"] = df["Balance"] / (df["EstimatedSalary"] + 1e-6)
            if "Tenure" in df.columns and "Age" in df.columns:
                df["Tenure_Age_Ratio"] = df["Tenure"] / (df["Age"] + 1e-6)
            if "CreditScore" in df.columns and "Age" in df.columns:
                df["CreditScore_Age_Ratio"] = df["CreditScore"] / (df["Age"] + 1e-6)
            # Manual OHE
            if "Geography" in df.columns:
                df["Geography_Germany"] = (df["Geography"] == "Germany").astype(int)
                df["Geography_Spain"] = (df["Geography"] == "Spain").astype(int)
            if "Gender" in df.columns:
                df["Gender_Male"] = (df["Gender"] == "Male").astype(int)
            for col in self.feature_columns:
                if col not in df.columns:
                    df[col] = 0.0
            X = df[self.feature_columns]
            try:
                return self.pipeline.predict_proba(X.values)[:, 1]
            except Exception:
                return self.pipeline.predict_proba(X)[:, 1]
                
        expected_features = getattr(self.pipeline, "feature_names_in_", None)
        if expected_features is None:
            for step_name, step_obj in self.pipeline.named_steps.items():
                if hasattr(step_obj, "feature_names_in_"):
                    expected_features = step_obj.feature_names_in_
                    break
        if expected_features is None:
            # Fallback for older scikit-learn models: look into ColumnTransformer
            for step_name, step_obj in self.pipeline.named_steps.items():
                if hasattr(step_obj, "transformers_"):
                    cols = []
                    for name, trans, columns in step_obj.transformers_:
                        if isinstance(columns, (list, tuple, np.ndarray)):
                            cols.extend([c for c in columns if isinstance(c, str)])
                    if cols:
                        expected_features = cols
                        break
        
        input_df = df_raw.copy()
        
        if expected_features is not None:
            import numpy as np
            # Fill missing columns with safe defaults
            for feature in expected_features:
                if feature not in input_df.columns:
                    input_df[feature] = np.nan
            
            # Reorder and filter out extra columns (like 'id')
            input_df = input_df[list(expected_features)]
            print(f"DEBUG EXPECTED: {expected_features}")
            print(f"DEBUG ACTUAL COLUMNS AFTER IMPUTATION: {input_df.columns.tolist()}")
        else:
            print("DEBUG EXPECTED: None")
            if "id" in input_df.columns:
                input_df = input_df.drop(columns=["id"])
                
        try:
            return self.pipeline.predict_proba(input_df)[:, 1]
        except ValueError as e:
            # Ultimate fallback: parse the missing columns directly from sklearn's ValueError
            err_str = str(e)
            if "columns are missing: " in err_str:
                import ast
                try:
                    missing_str = err_str.split("columns are missing: ")[1].strip()
                    missing_cols = ast.literal_eval(missing_str)
                    for col in missing_cols:
                        input_df[col] = np.nan
                    return self.pipeline.predict_proba(input_df)[:, 1]
                except:
                    raise e
            raise e

    def predict(self, df_raw: pd.DataFrame, threshold: float = 0.5) -> pd.DataFrame:
        probs = self.predict_proba(df_raw)
        out = df_raw.copy()
        out["churn_probability"] = np.round(probs, 4)
        out["churn_prediction"] = (probs >= threshold).astype(int)
        return out
