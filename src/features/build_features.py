"""
ChurnGuard - Feature Engineering
------------------------------------------------------------
Transforms raw customer data into model-ready features.
Kept as plain, inspectable pandas so every feature is easy to
explain to a business stakeholder (important for a FinTech
churn model where explainability matters).
"""

import pandas as pd

CATEGORICAL_COLS = ["salary_band", "channel"]

NUMERIC_FEATURES = [
    "age",
    "tenure_months",
    "num_products",
    "has_credit_card",
    "is_active_member",
    "avg_balance",
    "monthly_transactions",
    "support_tickets_last_90d",
    "balance_trend_pct",
    "days_since_last_login",
    "engagement_score",
    "is_inactive_recent",
    "is_single_product",
    "is_declining_balance",
    "is_low_tenure",
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Engagement score: composite of activity signals (higher = more engaged)
    df["engagement_score"] = (
        (df["monthly_transactions"] / (df["monthly_transactions"].max() + 1))
        + df["is_active_member"]
        - (df["days_since_last_login"] / 120)
        - (df["support_tickets_last_90d"] / 5)
    ).round(3)

    # Binary risk flags (business-interpretable)
    df["is_inactive_recent"] = (df["days_since_last_login"] > 45).astype(int)
    df["is_single_product"] = (df["num_products"] == 1).astype(int)
    df["is_declining_balance"] = (df["balance_trend_pct"] < -10).astype(int)
    df["is_low_tenure"] = (df["tenure_months"] < 12).astype(int)

    return df


def build_model_matrix(df: pd.DataFrame, fit_encoder: bool = True, encoder=None):
    """
    Returns (X, y, encoder). One-hot encodes categoricals, keeps numeric
    features as-is. `encoder` can be passed in at inference time to
    guarantee consistent columns.
    """
    df = engineer_features(df)

    cat_dummies = pd.get_dummies(df[CATEGORICAL_COLS], prefix=CATEGORICAL_COLS)
    X = pd.concat([df[NUMERIC_FEATURES], cat_dummies], axis=1)

    if not fit_encoder and encoder is not None:
        # Align columns to training-time schema (fills missing dummy cols with 0)
        X = X.reindex(columns=encoder, fill_value=0)
        fitted_columns = encoder
    else:
        fitted_columns = list(X.columns)

    y = df["churned"] if "churned" in df.columns else None
    return X, y, fitted_columns


if __name__ == "__main__":
    from pathlib import Path

    path = Path(__file__).resolve().parents[2] / "data" / "raw" / "churnguard_customers.csv"
    raw = pd.read_csv(path)
    X, y, cols = build_model_matrix(raw)
    print(f"Feature matrix shape: {X.shape}")
    print(f"Columns: {cols}")
