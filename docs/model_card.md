# ChurnGuard — Model Card

## Model
- **Type**: Logistic Regression
- **Task**: Binary classification — predict probability a FinTech customer churns
- **Trained on**: 6,400 rows | **Tested on**: 1,600 rows
- **Random seed**: 42

## Performance (held-out test set)
| Metric | Value |
|---|---|
| AUC-ROC | 0.8014 |
| Precision | 0.5506 |
| Recall | 0.7223 |
| F1 | 0.6249 |
| Precision @ Top 20% risk | 0.6906 |

**Confusion Matrix** (rows=actual, cols=predicted, [0,1]):
```
[[810, 293], [138, 359]]
```

## Comparison vs. Baseline
| Model | AUC-ROC | F1 |
|---|---|---|
| Logistic Regression (baseline) | 0.8014 | 0.6249 |
| XGBoost (candidate) | 0.7972 | 0.6248 |

## Intended Use
Ranks FinTech customers by churn risk to prioritize retention-team outreach
(e.g., targeting the top 20% highest-risk customers). Not intended as the
sole basis for account-level decisions (credit, closures) without human review.

## Features Used
21 engineered features including tenure, product
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
