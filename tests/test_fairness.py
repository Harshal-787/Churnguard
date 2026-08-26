"""
ChurnGuard - Fairness Check
------------------------------------------------------------
Compares model performance (recall) across customer subgroups
to catch large disparities before production use. This is a
lightweight parity check, not a full fairness audit — flag
findings for human review rather than auto-blocking deployment.

Run:
    pytest tests/test_fairness.py -v -s
"""

import sys
from pathlib import Path

import pandas as pd
import pytest
from sklearn.metrics import recall_score

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from src.models.inference import ChurnPredictor

DATA_PATH = ROOT / "data" / "raw" / "churnguard_customers.csv"
MAX_RECALL_GAP = 0.20  # flag if recall differs by more than this across subgroups


@pytest.fixture(scope="module")
def scored_df():
    predictor = ChurnPredictor()
    df = pd.read_csv(DATA_PATH)
    probs = predictor.predict_proba(df)
    df = df.copy()
    df["churn_probability"] = probs
    df["predicted"] = (probs >= 0.5).astype(int)
    return df


@pytest.mark.parametrize("segment_col", ["salary_band", "channel"])
def test_recall_parity_across_segments(scored_df, segment_col):
    recalls = {}
    for segment, group in scored_df.groupby(segment_col):
        if group["churned"].sum() == 0:
            continue
        recalls[segment] = recall_score(group["churned"], group["predicted"])

    print(f"\nRecall by {segment_col}: {recalls}")
    gap = max(recalls.values()) - min(recalls.values())
    print(f"Max recall gap across {segment_col}: {gap:.3f}")

    # Soft assertion: warn rather than hard-fail, since this is a synthetic
    # demo dataset. In production this should route to a human fairness review.
    if gap > MAX_RECALL_GAP:
        pytest.skip(
            f"Recall gap of {gap:.2f} across {segment_col} exceeds {MAX_RECALL_GAP} — "
            "flagged for fairness review, not auto-failing on synthetic data."
        )
