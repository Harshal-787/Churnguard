# Case Study: ChurnGuard — Predictive Churn Detection for FinTech

## The Problem

A digital banking (neobank-style) company loses recurring revenue every time
a customer churns, and the cost of acquiring a replacement customer is
significantly higher than the cost of retaining an existing one. Retention
teams typically operate reactively — reaching out only after a customer has
already shown extreme disengagement (e.g., closing an account), by which
point it's often too late to intervene.

**The question ChurnGuard answers:** which customers are at risk of churning
*before* they leave, and *why* — so a retention team can act early and with
a specific, relevant conversation rather than a generic save offer.

## Approach

I built ChurnGuard as a full end-to-end system rather than a model-only
exercise, treating it the way a real FinTech data/ML team would scope it:

1. **Requirements first.** Wrote a project charter, SRS, and system
   architecture doc before touching code, defining success not just as
   "high AUC" but as *Precision@Top-20%* — the metric that actually matters
   when a retention team has limited outreach capacity.

2. **Data pipeline with validation.** Built a synthetic FinTech customer
   dataset with a hand-crafted, business-logic-driven churn signal (recent
   inactivity, declining balance, single-product relationships, and support
   complaints all increase risk — mirroring real retention intuition), then
   added schema/range/class-balance validation that fails loudly on bad data
   before it ever reaches the model.

3. **Model development with a real comparison.** Trained a Logistic
   Regression baseline against XGBoost, selected the best by AUC-ROC
   (0.80), and documented both in a Model Card rather than just shipping
   whichever model happened to run last.

4. **Explainability as a first-class feature, not an afterthought.** Every
   prediction is paired with a SHAP-based breakdown of the top contributing
   factors. Getting this right required catching and fixing a real bug: SHAP
   values collapse to near-zero when explaining a single row in isolation,
   because there's no baseline to compare against — fixed by sampling a
   background reference set of real customers, standard SHAP practice.

5. **A shared inference layer to prevent train/serve skew.** Both the API
   and the explainability module route through one `ChurnPredictor` class
   that owns feature-building and scaling. This was a direct response to
   catching a scaling bug during development (the linear model expected
   standardized inputs; the explainer was initially feeding it raw values) —
   centralizing the logic makes that entire class of bug structurally
   impossible going forward.

6. **Testing as a deployment gate, not an afterthought.** The test suite
   includes a hard CI gate: if a retrained model's AUC or Precision@Top-20%
   drops below threshold, the pipeline fails before deployment. A
   lightweight fairness check also compares recall across salary-band and
   channel segments to catch large disparities early.

7. **Two consumer surfaces.** A FastAPI service for programmatic/CRM
   integration, and a Streamlit dashboard for retention analysts to browse
   risk scores, drill into individual explanations, and review model health
   — because a model only creates value once someone can act on it.

## Results

| Metric | Value |
|---|---|
| AUC-ROC | 0.80 |
| Precision @ Top 20% risk | 0.69 |
| Recall | 0.72 |
| Fairness (recall gap across segments) | < 3% |

**Business framing:** if the retention team focuses outreach on the top 20%
of customers ChurnGuard flags as highest-risk, roughly 7 in 10 of those
contacts would be reaching someone who was genuinely on a path to churn —
turning broad, low-conversion outreach into targeted, higher-yield
conversations.

## What This Demonstrates

- Ability to scope and document a project the way a real team would
  (charter → SRS → architecture → implementation), not just write model code
- Judgment about which metric actually matters for the business use case,
  not just optimizing a generic score
- Debugging real ML-systems bugs (train/serve skew, SHAP baseline
  requirements) that only surface once you build past the notebook stage
- End-to-end ownership: data, modeling, API, frontend, testing, CI/CD, and
  deployment documentation, all in one coherent, runnable system

## Honest Limitations

This project uses synthetic data by design — there's no real customer data
involved. The churn signal is realistic and hand-crafted, not learned from
actual behavior, so absolute performance numbers won't directly transfer to
a live deployment. The "next steps" section in the README lays out exactly
what would change with a real dataset: re-validating every threshold,
adding streaming ingestion, and wiring in drift monitoring.
