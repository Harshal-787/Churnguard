"""
ChurnGuard - Model Explainability (SHAP)
------------------------------------------------------------
Generates per-customer SHAP explanations, always going through
ChurnPredictor so feature-building and scaling exactly match
what the model was trained and served on.
"""

import sys
from functools import lru_cache
from pathlib import Path

import pandas as pd
import shap

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from src.models.inference import ChurnPredictor

DATA_PATH = ROOT / "data" / "raw" / "churnguard_customers.csv"
BACKGROUND_SAMPLE_SIZE = 200


@lru_cache(maxsize=1)
def _background_model_input(predictor: ChurnPredictor):
    """
    A reference sample of real customers used as the SHAP baseline.
    Without this, explaining a single row in isolation collapses every
    contribution to ~0 (it has nothing to compare itself against).
    """
    ref_df = pd.read_csv(DATA_PATH).sample(
        n=min(BACKGROUND_SAMPLE_SIZE, 8000), random_state=42
    )
    X_ref = predictor._prepare_matrix(ref_df)
    return predictor._to_model_input(X_ref)


def explain_batch(df_raw: pd.DataFrame, top_n: int = 5):
    """
    Returns per-row top-N SHAP contributors as a list of dicts:
    [{"customer_id": ..., "churn_probability": ..., "top_factors": [...]}, ...]
    """
    predictor = ChurnPredictor()
    X = predictor._prepare_matrix(df_raw)
    model_input = predictor._to_model_input(X)
    background = _background_model_input(predictor)

    if predictor.model_type == "xgboost":
        explainer = shap.TreeExplainer(predictor.model, background)
        shap_values = explainer.shap_values(model_input)
    else:
        explainer = shap.LinearExplainer(predictor.model, background)
        shap_values = explainer.shap_values(model_input)

    probs = predictor.model.predict_proba(model_input)[:, 1]

    results = []
    for i in range(len(X)):
        row_shap = pd.Series(shap_values[i], index=predictor.feature_cols)
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
                "customer_id": df_raw.iloc[i]["customer_id"] if "customer_id" in df_raw.columns else i,
                "churn_probability": round(float(probs[i]), 4),
                "top_factors": factors,
            }
        )
    return results


if __name__ == "__main__":
    import json

    data_path = ROOT / "data" / "raw" / "churnguard_customers.csv"
    df = pd.read_csv(data_path).head(5)
    explanations = explain_batch(df)
    print(json.dumps(explanations, indent=2))
