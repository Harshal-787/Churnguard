"""
ChurnGuard - Data Validation
------------------------------------------------------------
Schema + quality checks for the raw customer dataset before it
enters the feature engineering pipeline. Fails loudly on
violations so bad data never silently reaches the model.
"""

import pandas as pd

REQUIRED_COLUMNS = {
    "customer_id": "object",
    "age": "int",
    "tenure_months": "int",
    "num_products": "int",
    "has_credit_card": "int",
    "is_active_member": "int",
    "avg_balance": "float",
    "monthly_transactions": "int",
    "support_tickets_last_90d": "int",
    "balance_trend_pct": "float",
    "days_since_last_login": "int",
    "salary_band": "object",
    "channel": "object",
    "churned": "int",
}


class DataValidationError(Exception):
    pass


def validate(df: pd.DataFrame) -> dict:
    """Run schema + quality checks. Returns a report dict. Raises on hard failures."""
    report = {"rows": len(df), "issues": [], "warnings": []}

    # 1. Required columns present
    missing = set(REQUIRED_COLUMNS) - set(df.columns)
    if missing:
        raise DataValidationError(f"Missing required columns: {missing}")

    # 2. No duplicate customer IDs
    dupes = df["customer_id"].duplicated().sum()
    if dupes > 0:
        report["issues"].append(f"{dupes} duplicate customer_id rows found")

    # 3. Null checks
    null_counts = df[list(REQUIRED_COLUMNS)].isnull().sum()
    nulls = null_counts[null_counts > 0]
    if not nulls.empty:
        report["warnings"].append(f"Nulls found: {nulls.to_dict()}")

    # 4. Range / sanity checks
    if (df["age"] < 18).any() or (df["age"] > 100).any():
        report["issues"].append("age values outside plausible range [18, 100]")
    if (df["avg_balance"] < 0).any():
        report["issues"].append("negative avg_balance values found")
    if not df["churned"].isin([0, 1]).all():
        report["issues"].append("churned column contains values outside {0, 1}")

    # 5. Class balance
    churn_rate = df["churned"].mean()
    report["churn_rate"] = round(float(churn_rate), 4)
    if churn_rate < 0.02 or churn_rate > 0.6:
        report["warnings"].append(f"Unusual churn rate: {churn_rate:.2%}")

    if report["issues"]:
        raise DataValidationError(f"Validation failed: {report['issues']}")

    report["status"] = "PASSED"
    return report


if __name__ == "__main__":
    from pathlib import Path

    path = Path(__file__).resolve().parents[2] / "data" / "raw" / "churnguard_customers.csv"
    df = pd.read_csv(path)
    result = validate(df)
    print("Data Quality Report")
    print("--------------------")
    for k, v in result.items():
        print(f"{k}: {v}")
