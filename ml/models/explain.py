"""
ChurnGuard - Model Explainability (SHAP)
"""

import sys
from functools import lru_cache
from pathlib import Path

import pandas as pd
import numpy as np
import shap

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from ml.models.inference import ChurnPredictor

DATA_PATH = ROOT / "data" / "raw" / "churnguard_customers.csv"

@lru_cache(maxsize=1)
def _get_background_data():
    df = pd.read_csv(DATA_PATH)
    return df.sample(n=min(50, len(df)), random_state=42)

def explain_batch(df_raw: pd.DataFrame, top_n: int = 5):
    if df_raw.empty:
        return []
        
    predictor = ChurnPredictor()
    bg_df = _get_background_data()
    
    X_bg = bg_df.drop(columns=["id", "customer_id"], errors='ignore')
    X_explain = df_raw.drop(columns=["id", "customer_id"], errors='ignore')
    
    # Ensure columns match exactly
    for col in X_bg.columns:
        if col not in X_explain.columns:
            X_explain[col] = np.nan
    X_explain = X_explain[X_bg.columns]

    def predict_fn(X):
        if isinstance(X, np.ndarray):
            X = pd.DataFrame(X, columns=X_bg.columns)
        return predictor.predict_proba(X)

    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        # Extremely fast mode: 5 background samples, 10 eval samples
        explainer = shap.KernelExplainer(predict_fn, shap.sample(X_bg, 5))
        shap_values = explainer.shap_values(X_explain, nsamples=10, silent=True)
    
    probs = predict_fn(X_explain)
    
    results = []
    for i in range(len(X_explain)):
        row_shap = pd.Series(shap_values[i], index=X_bg.columns)
        top = row_shap.reindex(row_shap.abs().sort_values(ascending=False).index).head(top_n)
        factors = [
            {
                "feature": feat,
                "impact": round(float(val), 4),
                "direction": "increases risk" if val > 0 else "decreases risk",
            }
            for feat, val in top.items()
        ]
        results.append(
            {
                "customer_id": df_raw.iloc[i].get("id", i),
                "churn_probability": round(float(probs[i]), 4),
                "top_factors": factors,
            }
        )
    return results
