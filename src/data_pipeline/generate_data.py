"""
ChurnGuard - Synthetic FinTech Customer Dataset Generator
------------------------------------------------------------
Generates a realistic, synthetic customer dataset for a digital
banking / neobank persona, with an engineered churn label driven
by interpretable business logic (so the model has real signal to learn).

Run:
    python src/data_pipeline/generate_data.py
"""

from pathlib import Path

import numpy as np
import pandas as pd

RANDOM_SEED = 42
N_CUSTOMERS = 8000

OUTPUT_PATH = Path(__file__).resolve().parents[2] / "data" / "raw" / "churnguard_customers.csv"


def generate_dataset(n: int = N_CUSTOMERS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    customer_id = [f"CUST{100000 + i}" for i in range(n)]

    tenure_months = rng.integers(1, 96, size=n)
    age = rng.integers(18, 75, size=n)

    num_products = rng.choice([1, 2, 3, 4], size=n, p=[0.45, 0.35, 0.15, 0.05])
    has_credit_card = rng.choice([0, 1], size=n, p=[0.35, 0.65])
    is_active_member = rng.choice([0, 1], size=n, p=[0.4, 0.6])

    avg_balance = np.round(np.clip(rng.normal(loc=5200, scale=4800, size=n), 0, None), 2)
    monthly_transactions = np.round(np.clip(rng.normal(loc=18, scale=10, size=n), 0, None)).astype(int)

    support_tickets_last_90d = rng.poisson(lam=0.6, size=n)
    complaint_flag = (support_tickets_last_90d >= 3).astype(int)

    balance_trend_pct = np.round(rng.normal(loc=0, scale=15, size=n), 2)  # % change last 90d
    days_since_last_login = rng.integers(0, 120, size=n)

    salary_band = rng.choice(
        ["low", "mid", "high"], size=n, p=[0.35, 0.45, 0.20]
    )

    channel = rng.choice(
        ["mobile_app", "web", "branch"], size=n, p=[0.6, 0.3, 0.1]
    )

    # ---- Engineered churn probability (business-logic driven signal) ----
    logit = (
        -3.1
        + 1.8 * (is_active_member == 0)
        + 1.5 * (days_since_last_login > 45)
        + 1.1 * complaint_flag
        + 0.9 * (num_products == 1)
        - 0.8 * (num_products >= 3)
        + 1.3 * (balance_trend_pct < -10)
        - 0.9 * (tenure_months > 36)
        + 0.7 * (monthly_transactions < 5)
        + 0.5 * (has_credit_card == 0)
        + 0.3 * (channel == "branch")
        + rng.normal(0, 0.35, size=n)  # noise (kept nonzero to stay realistic)
    )
    churn_prob = 1 / (1 + np.exp(-logit))
    churned = rng.binomial(1, churn_prob)

    df = pd.DataFrame(
        {
            "customer_id": customer_id,
            "age": age,
            "tenure_months": tenure_months,
            "num_products": num_products,
            "has_credit_card": has_credit_card,
            "is_active_member": is_active_member,
            "avg_balance": avg_balance,
            "monthly_transactions": monthly_transactions,
            "support_tickets_last_90d": support_tickets_last_90d,
            "balance_trend_pct": balance_trend_pct,
            "days_since_last_login": days_since_last_login,
            "salary_band": salary_band,
            "channel": channel,
            "churned": churned,
        }
    )
    return df


if __name__ == "__main__":
    df = generate_dataset()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Generated {len(df):,} rows -> {OUTPUT_PATH}")
    print(f"Churn rate: {df['churned'].mean():.2%}")
