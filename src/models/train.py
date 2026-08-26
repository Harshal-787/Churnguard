"""
ChurnGuard - Model Training
------------------------------------------------------------
Trains a baseline Logistic Regression and a tuned XGBoost
classifier for churn prediction, evaluates both, and persists
the best model + metadata + a Model Card.

Run:
    python src/models/train.py
"""

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from src.features.build_features import build_model_matrix

DATA_PATH = ROOT / "data" / "raw" / "churnguard_customers.csv"
MODEL_DIR = ROOT / "models"
DOCS_DIR = ROOT / "docs"
RANDOM_SEED = 42


def precision_at_k(y_true, y_score, k_frac=0.2):
    """Precision among the top-k% highest-risk customers (business-relevant metric)."""
    n = len(y_true)
    k = max(1, int(n * k_frac))
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
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
    }


def main():
    MODEL_DIR.mkdir(exist_ok=True)
    DOCS_DIR.mkdir(exist_ok=True)

    df = pd.read_csv(DATA_PATH)
    X, y, feature_cols = build_model_matrix(df, fit_encoder=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_SEED
    )

    results = {}

    # ---------------- Baseline: Logistic Regression ----------------
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    log_reg = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=RANDOM_SEED)
    log_reg.fit(X_train_scaled, y_train)
    lr_scores = log_reg.predict_proba(X_test_scaled)[:, 1]
    results["logistic_regression"] = evaluate(y_test, lr_scores)

    # ---------------- Candidate: XGBoost ----------------
    scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
    xgb = XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        scale_pos_weight=scale_pos_weight,
        eval_metric="auc",
        random_state=RANDOM_SEED,
    )
    xgb.fit(X_train, y_train)
    xgb_scores = xgb.predict_proba(X_test)[:, 1]
    results["xgboost"] = evaluate(y_test, xgb_scores)

    # ---------------- Select best model by AUC ----------------
    best_name = max(results, key=lambda k: results[k]["auc_roc"])
    best_model = xgb if best_name == "xgboost" else log_reg
    print(f"\nBest model: {best_name} (AUC={results[best_name]['auc_roc']})")

    # Persist model + supporting artifacts.
    # Note: scaler is only meaningful/applied when best_name == "logistic_regression";
    # inference.py checks model_type before applying it, so it's harmless either way.
    joblib.dump(best_model, MODEL_DIR / "churn_model.joblib")
    joblib.dump(scaler, MODEL_DIR / "scaler.joblib")
    joblib.dump(feature_cols, MODEL_DIR / "feature_columns.joblib")
    with open(MODEL_DIR / "model_type.txt", "w") as f:
        f.write(best_name)

    metadata = {
        "best_model": best_name,
        "feature_columns": feature_cols,
        "results": results,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "random_seed": RANDOM_SEED,
    }
    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    # Top feature importances (for XGBoost) written for the Model Card / dashboard
    if best_name == "xgboost":
        importances = pd.Series(best_model.feature_importances_, index=feature_cols)
        importances.sort_values(ascending=False).head(15).to_json(
            MODEL_DIR / "feature_importance.json"
        )

    write_model_card(metadata)
    print("\nSaved model, metadata, and model card to /models and /docs")
    print(json.dumps(results, indent=2))


def write_model_card(metadata: dict):
    best = metadata["best_model"]
    res = metadata["results"][best]
    card = f"""# ChurnGuard — Model Card

## Model
- **Type**: {"XGBoost Classifier" if best == "xgboost" else "Logistic Regression"}
- **Task**: Binary classification — predict probability a FinTech customer churns
- **Trained on**: {metadata['train_rows']:,} rows | **Tested on**: {metadata['test_rows']:,} rows
- **Random seed**: {metadata['random_seed']}

## Performance (held-out test set)
| Metric | Value |
|---|---|
| AUC-ROC | {res['auc_roc']} |
| Precision | {res['precision']} |
| Recall | {res['recall']} |
| F1 | {res['f1']} |
| Precision @ Top 20% risk | {res['precision_at_top20pct']} |

**Confusion Matrix** (rows=actual, cols=predicted, [0,1]):
```
{res['confusion_matrix']}
```

## Comparison vs. Baseline
| Model | AUC-ROC | F1 |
|---|---|---|
| Logistic Regression (baseline) | {metadata['results']['logistic_regression']['auc_roc']} | {metadata['results']['logistic_regression']['f1']} |
| XGBoost (candidate) | {metadata['results']['xgboost']['auc_roc']} | {metadata['results']['xgboost']['f1']} |

## Intended Use
Ranks FinTech customers by churn risk to prioritize retention-team outreach
(e.g., targeting the top 20% highest-risk customers). Not intended as the
sole basis for account-level decisions (credit, closures) without human review.

## Features Used
{len(metadata['feature_columns'])} engineered features including tenure, product
holdings, engagement score, recent activity flags, balance trend, and
demographic/channel indicators. Full list in `models/feature_columns.joblib`.

## Limitations
- Trained on **synthetic data** generated for portfolio/demo purposes; real
  deployment requires validation on live customer data.
- Business-logic-driven synthetic labels may not capture all real-world
  churn drivers (e.g., macroeconomic factors, competitor offers).
- Precision@Top-20% should be re-validated against the retention team's
  actual outreach capacity.

## Fairness Note
Recommend evaluating performance parity across `salary_band` and `age`
segments before production use (see `tests/test_fairness.py`).
"""
    with open(DOCS_DIR / "model_card.md", "w") as f:
        f.write(card)


if __name__ == "__main__":
    main()
