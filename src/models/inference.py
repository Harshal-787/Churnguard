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

from src.features.build_features import build_model_matrix

MODEL_DIR = ROOT / "models"


class ChurnPredictor:
    def __init__(self):
        self.model = joblib.load(MODEL_DIR / "churn_model.joblib")
        self.scaler = joblib.load(MODEL_DIR / "scaler.joblib")
        self.feature_cols = joblib.load(MODEL_DIR / "feature_columns.joblib")
        self.model_type = (MODEL_DIR / "model_type.txt").read_text().strip()

    def _prepare_matrix(self, df_raw: pd.DataFrame) -> pd.DataFrame:
        X, _, _ = build_model_matrix(df_raw, fit_encoder=False, encoder=self.feature_cols)
        return X

    def _to_model_input(self, X: pd.DataFrame) -> np.ndarray:
        if self.model_type == "logistic_regression":
            return self.scaler.transform(X)
        return X.values

    def predict_proba(self, df_raw: pd.DataFrame) -> np.ndarray:
        X = self._prepare_matrix(df_raw)
        model_input = self._to_model_input(X)
        return self.model.predict_proba(model_input)[:, 1]

    def predict(self, df_raw: pd.DataFrame, threshold: float = 0.5) -> pd.DataFrame:
        probs = self.predict_proba(df_raw)
        out = df_raw.copy()
        out["churn_probability"] = np.round(probs, 4)
        out["churn_prediction"] = (probs >= threshold).astype(int)
        return out
