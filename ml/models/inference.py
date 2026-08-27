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

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

MODEL_DIR = ROOT / "saved_models"

class ChurnPredictor:
    def __init__(self):
        self.pipeline = joblib.load(MODEL_DIR / "churn_pipeline.joblib")

    def predict_proba(self, df_raw: pd.DataFrame) -> np.ndarray:
        return self.pipeline.predict_proba(df_raw)[:, 1]

    def predict(self, df_raw: pd.DataFrame, threshold: float = 0.5) -> pd.DataFrame:
        probs = self.predict_proba(df_raw)
        out = df_raw.copy()
        out["churn_probability"] = np.round(probs, 4)
        out["churn_prediction"] = (probs >= threshold).astype(int)
        return out
