"""
ChurnGuard - Model Explainability (SHAP)
"""

import sys
import json
from pathlib import Path
from functools import lru_cache

import pandas as pd
import numpy as np
import shap
import warnings

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from ml.models.inference import ChurnPredictor

DATA_PATH = ROOT / "data" / "raw" / "Churn_Modelling.csv"
MODEL_DIR = ROOT / "saved_models"

@lru_cache(maxsize=1)
def _get_background_data():
    df = pd.read_csv(DATA_PATH)
    return df.sample(n=min(50, len(df)), random_state=42)

def explain_batch(df_raw: pd.DataFrame, top_n: int = 5):
    if df_raw.empty:
        return []
        
    predictor = ChurnPredictor()
    
    # 1. Preprocess data strictly numerically
    X_processed = predictor.preprocess_for_explain(df_raw)
    probs = predictor.predict_proba(df_raw)
    if probs.ndim == 2:
        probs = probs[:, 1]
        
    # 2. Get true feature names from metadata
    feature_names = None
    meta_path = MODEL_DIR / "metadata_churn_pipeline.joblib.json"
    if meta_path.exists():
        try:
            with open(meta_path, "r") as f:
                feature_names = json.load(f).get("features")
        except:
            pass
            
    if not feature_names:
        # Fallback: assume columns from background data matching legacy behavior
        bg_df = _get_background_data()
        feature_names = list(bg_df.drop(columns=["id", "customer_id"], errors='ignore').columns)
        
    # 3. Extract estimators from pipeline
    classifier = predictor.pipeline.steps[-1][1] if hasattr(predictor.pipeline, "steps") else predictor.pipeline
    estimators = getattr(classifier, "estimators_", [classifier])
    
    shap_matrices = []
    
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        for est in estimators:
            if est is None: continue
            try:
                # Some sklearn wrappers need their underlying boosters
                explainer = shap.TreeExplainer(est)
                sv = explainer.shap_values(X_processed)
                
                # Normalize output to positive class (N, Features)
                if isinstance(sv, list):
                    sv = sv[-1] # Usually index 1 is positive class for binary RF
                elif sv.ndim == 3:
                    sv = sv[:, :, -1]
                    
                shap_matrices.append(sv)
            except Exception as e:
                print(f"Skipping SHAP for estimator {type(est).__name__}: {e}")
                
    if shap_matrices:
        # Exact linear SHAP of soft voting ensemble is the average of base SHAP values
        final_shap_values = np.mean(shap_matrices, axis=0)
    else:
        # 4. Fallback to KernelExplainer if no TreeExplainer succeeds (e.g. non-tree models)
        print("Falling back to KernelExplainer...")
        bg_df = _get_background_data()
        X_bg = bg_df.drop(columns=["id", "customer_id"], errors='ignore')
        X_explain = df_raw.drop(columns=["id", "customer_id"], errors='ignore')
        for col in X_bg.columns:
            if col not in X_explain.columns:
                X_explain[col] = np.nan
        X_explain = X_explain[X_bg.columns]

        def predict_fn(X):
            if isinstance(X, np.ndarray):
                X = pd.DataFrame(X, columns=X_bg.columns)
            return predictor.predict_proba(X)

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            explainer = shap.KernelExplainer(predict_fn, shap.sample(X_bg, 5))
            final_shap_values = explainer.shap_values(X_explain, nsamples=10, silent=True)
            if isinstance(final_shap_values, list):
                final_shap_values = final_shap_values[-1]
                
        feature_names = X_bg.columns

    # 5. Format results for dashboard
    results = []
    for i in range(len(df_raw)):
        # Handle case where feature_names might be shorter than final_shap_values width
        valid_len = min(len(feature_names), final_shap_values.shape[1])
        row_shap = pd.Series(final_shap_values[i, :valid_len], index=feature_names[:valid_len])
        
        top = row_shap.reindex(row_shap.abs().sort_values(ascending=False).index).head(top_n)
        factors = [
            {
                "feature": feat.replace("num__", "").replace("cat__", ""),
                "impact": round(float(val), 4),
                "direction": "increases risk" if val > 0 else "decreases risk",
            }
            for feat, val in top.items() if abs(val) > 0.0001
        ]
        
        results.append({
            "customer_id": df_raw.iloc[i].get("id", i),
            "churn_probability": round(float(probs[i]), 4),
            "top_factors": factors,
        })
        
    return results
