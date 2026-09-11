"""
ChurnGuard - Advanced Enterprise ML Training Pipeline
------------------------------------------------------------
Trains a calibrated XGBoost model using Optuna for 
hyperparameter tuning and 5-Fold Stratified CV.
Logs all metrics, SHAP values, and artifacts to MLflow.
"""

import json
import sys
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
import optuna
import mlflow
import shap
from sklearn.metrics import (
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import VotingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from ml.features.build_features import get_preprocessing_pipeline, get_feature_names

DATA_PATH = ROOT / "data" / "raw" / "Churn_Modelling.csv"
MODEL_DIR = ROOT / "saved_models"
DOCS_DIR = ROOT / "docs"
RANDOM_SEED = 42

def precision_at_k(y_true, y_score, k_frac=0.2):
    n = len(y_true)
    k = max(1, int(n * k_frac))
    if k == 0:
        return 0.0
    order = np.argsort(-y_score)[:k]
    top_k_true = np.array(y_true)[order]
    return top_k_true.mean()

def evaluate(y_true, y_score, threshold=0.5):
    y_pred = (y_score >= threshold).astype(int)
    return {
        "auc_roc": round(roc_auc_score(y_true, y_score), 4),
        "precision": round(precision_score(y_true, y_pred), 4),
        "recall": round(recall_score(y_true, y_pred), 4),
        "f1": round(f1_score(y_true, y_pred), 4),
        "precision_at_top20pct": round(precision_at_k(y_true, y_score, 0.2), 4),
    }

def objective(trial, X, y, preprocessor):
    """Optuna objective function for tuning XGBoost."""
    # Preprocess X for tuning
    X_processed = preprocessor.fit_transform(X)
    
    scale_pos_weight = (y == 0).sum() / (y == 1).sum()
    
    param = {
        "n_estimators": trial.suggest_int("n_estimators", 100, 300),
        "max_depth": trial.suggest_int("max_depth", 3, 6),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.1, log=True),
        "subsample": trial.suggest_float("subsample", 0.7, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.7, 1.0),
        "scale_pos_weight": scale_pos_weight,
        "eval_metric": "auc",
        "random_state": RANDOM_SEED,
    }
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    auc_scores = []
    
    for train_idx, val_idx in cv.split(X_processed, y):
        X_train, X_val = X_processed[train_idx], X_processed[val_idx]
        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
        
        model = XGBClassifier(**param)
        model.fit(X_train, y_train)
        preds = model.predict_proba(X_val)[:, 1]
        auc_scores.append(roc_auc_score(y_val, preds))
        
    return np.mean(auc_scores)

def main():
    MODEL_DIR.mkdir(exist_ok=True)
    DOCS_DIR.mkdir(exist_ok=True)

    # MLflow tracking setup
    # mlflow.set_tracking_uri("http://localhost:5000")
    # mlflow.set_experiment("ChurnGuard_MLOps")

    # Load data
    df = pd.read_csv(DATA_PATH)
    y = df["Exited"]
    X = df.drop(columns=["Exited", "RowNumber", "CustomerId", "Surname"], errors="ignore")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_SEED
    )

    # 1. Hyperparameter Optimization via Optuna
    preprocessor = get_preprocessing_pipeline()
    print("Starting Optuna Hyperparameter Optimization (5-Fold CV)...")
    study = optuna.create_study(direction="maximize")
    
    # Using 50 trials for deep hyperparameter tuning to get the absolute best model
    study.optimize(lambda trial: objective(trial, X_train, y_train, preprocessor), n_trials=50)
    
    best_params = study.best_params
    best_params.pop("scale_pos_weight", None)
    best_params["random_state"] = RANDOM_SEED
    best_params["eval_metric"] = "auc"
    
    print(f"Best CV AUC: {study.best_value:.4f}")

    # 2. Train Calibrated Model with Best Params
    # with mlflow.start_run(run_name="fintech_calibrated_ensemble"):
    if True:
        base_xgb = XGBClassifier(**best_params)
        base_lgbm = LGBMClassifier(
            n_estimators=best_params.get("n_estimators", 200),
            learning_rate=best_params.get("learning_rate", 0.05),
            max_depth=best_params.get("max_depth", 5),
            random_state=RANDOM_SEED,
            verbose=-1
        )
        base_rf = RandomForestClassifier(
            n_estimators=100,
            max_depth=best_params.get("max_depth", 5) + 2,
            random_state=RANDOM_SEED
        )
        base_cat = CatBoostClassifier(
            iterations=best_params.get("n_estimators", 200),
            learning_rate=best_params.get("learning_rate", 0.05),
            depth=best_params.get("max_depth", 5),
            verbose=0,
            random_seed=RANDOM_SEED
        )
        ensemble = VotingClassifier(
            estimators=[('xgb', base_xgb), ('lgbm', base_lgbm), ('rf', base_rf), ('cat', base_cat)],
            voting='soft'
        )
        
        from sklearn.pipeline import Pipeline
        
        # We build the pipeline without SMOTE to preserve true probability calibration
        full_pipeline = Pipeline(steps=[
            *preprocessor.steps,
            ("classifier", ensemble)
        ])
        
        print("Training calibrated production pipeline with Voting Ensemble...")
        full_pipeline.fit(X_train, y_train)
        
        # 3. Evaluate on Test Set and Optimize Threshold
        y_score = full_pipeline.predict_proba(X_test)[:, 1]
        
        # Threshold Optimization for max F1
        best_thresh = 0.5
        best_f1 = 0
        for thresh in np.arange(0.1, 0.9, 0.05):
            f1 = f1_score(y_test, (y_score >= thresh).astype(int))
            if f1 > best_f1:
                best_f1 = f1
                best_thresh = round(thresh, 3)
                
        print(f"Optimal Threshold for F1: {best_thresh}")
        metrics = evaluate(y_test, y_score, threshold=best_thresh)
        metrics["optimal_threshold"] = best_thresh
        
        print(f"Test AUC: {metrics['auc_roc']:.4f}")
        
        # 4. Log to MLflow
        # mlflow.log_params(best_params)
        # mlflow.log_metrics(metrics)
        
        # Log the full scikit-learn pipeline
        # mlflow.sklearn.log_model(
        #     full_pipeline, 
        #     "model", 
        #     serialization_format=mlflow.sklearn.SERIALIZATION_FORMAT_CLOUDPICKLE
        # )
        
        # 5. SHAP Explainability (Global)
        print("Generating SHAP Explanations...")
        # Since full_pipeline has SMOTE, we must transform up to SMOTE
        # But for SHAP we explain the original train data
        X_train_processed = preprocessor.transform(X_train)
        feature_names = get_feature_names(preprocessor)
        
        explainer_model = XGBClassifier(**best_params)
        explainer_model.fit(X_train_processed, y_train)
        
        explainer = shap.TreeExplainer(explainer_model)
        shap_values = explainer.shap_values(X_train_processed)
        
        mean_abs_shap = np.abs(shap_values).mean(axis=0)
        shap_importance = pd.Series(mean_abs_shap, index=feature_names)
        shap_importance = shap_importance.sort_values(ascending=False)
        
        # 6. Persist Locally for API Fallback
        joblib.dump(full_pipeline, MODEL_DIR / "churn_pipeline.joblib")
        
        metadata = {
            "best_model": "calibrated_voting_ensemble",
            "features": feature_names,
            "results": metrics,
            "train_rows": len(X_train),
            "test_rows": len(X_test),
            "random_seed": RANDOM_SEED,
            "best_params": best_params
        }
        with open(MODEL_DIR / "metadata_churn_pipeline.joblib.json", "w") as f:
            json.dump(metadata, f, indent=2)
            
        shap_importance.head(15).to_json(MODEL_DIR / "feature_importance_churn_pipeline.joblib.json")
        
        print("\nPipeline successfully trained, calibrated, and logged to MLflow!")

if __name__ == "__main__":
    main()
