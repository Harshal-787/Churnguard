"""
ChurnGuard - Test Suite
------------------------------------------------------------
Covers: data validation, feature engineering, model performance
gate, and API contract. Run with:

    pytest tests/ -v
"""

import sys
from pathlib import Path

import pandas as pd
import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from src.data_pipeline.validate import DataValidationError, validate
from src.features.build_features import build_model_matrix, engineer_features

DATA_PATH = ROOT / "data" / "raw" / "churnguard_customers.csv"


@pytest.fixture(scope="module")
def raw_df():
    return pd.read_csv(DATA_PATH)


# ---------------- Data validation ----------------

def test_validation_passes_on_clean_data(raw_df):
    report = validate(raw_df)
    assert report["status"] == "PASSED"
    assert report["rows"] == len(raw_df)


def test_validation_rejects_missing_columns(raw_df):
    broken = raw_df.drop(columns=["churned"])
    with pytest.raises(DataValidationError):
        validate(broken)


def test_validation_rejects_invalid_age(raw_df):
    broken = raw_df.copy()
    broken.loc[0, "age"] = 200
    with pytest.raises(DataValidationError):
        validate(broken)


# ---------------- Feature engineering ----------------

def test_engineer_features_adds_expected_columns(raw_df):
    out = engineer_features(raw_df)
    for col in ["engagement_score", "is_inactive_recent", "is_single_product", "is_declining_balance"]:
        assert col in out.columns


def test_build_model_matrix_shape(raw_df):
    X, y, cols = build_model_matrix(raw_df, fit_encoder=True)
    assert X.shape[0] == len(raw_df)
    assert y.shape[0] == len(raw_df)
    assert len(cols) == X.shape[1]
    assert X.isnull().sum().sum() == 0


def test_build_model_matrix_consistent_schema_at_inference(raw_df):
    """Inference-time matrix must align to the training-time schema even
    if a batch is missing some categorical values."""
    _X_train, _, cols = build_model_matrix(raw_df, fit_encoder=True)
    single_row = raw_df.iloc[[0]]
    X_infer, _, _ = build_model_matrix(single_row, fit_encoder=False, encoder=cols)
    assert list(X_infer.columns) == cols


# ---------------- Model performance gate ----------------

def test_model_meets_minimum_performance():
    """CI gate: block deployment if model quality regresses."""
    import json

    metadata_path = ROOT / "models" / "metadata.json"
    if not metadata_path.exists():
        pytest.skip("Model not trained yet — run `python src/models/train.py` first")

    with open(metadata_path) as f:
        meta = json.load(f)

    best = meta["best_model"]
    res = meta["results"][best]

    assert res["auc_roc"] >= 0.70, f"AUC {res['auc_roc']} below minimum threshold 0.70"
    assert res["precision_at_top20pct"] >= 0.40, "Top-20% precision below business-usefulness threshold"


# ---------------- API contract ----------------

@pytest.fixture(scope="module")
def api_client():
    from src.api.main import app

    return TestClient(app)


SAMPLE_CUSTOMER = {
    "customer_id": "CUST_TEST_001",
    "age": 40,
    "tenure_months": 24,
    "num_products": 2,
    "has_credit_card": 1,
    "is_active_member": 1,
    "avg_balance": 5000.0,
    "monthly_transactions": 15,
    "support_tickets_last_90d": 0,
    "balance_trend_pct": 2.0,
    "days_since_last_login": 5,
    "salary_band": "mid",
    "channel": "mobile_app",
}


def test_health_endpoint(api_client):
    resp = api_client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["model_loaded"] is True


def test_predict_endpoint_shape(api_client):
    resp = api_client.post("/predict", json=SAMPLE_CUSTOMER)
    assert resp.status_code == 200
    body = resp.json()
    assert 0.0 <= body["churn_probability"] <= 1.0
    assert body["churn_prediction"] in (0, 1)
    assert body["risk_tier"] in ("low", "medium", "high")


def test_predict_batch_endpoint(api_client):
    resp = api_client.post("/predict/batch", json={"customers": [SAMPLE_CUSTOMER]})
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_predict_rejects_invalid_payload(api_client):
    bad_customer = dict(SAMPLE_CUSTOMER)
    bad_customer["age"] = 5  # below allowed range
    resp = api_client.post("/predict", json=bad_customer)
    assert resp.status_code == 422
