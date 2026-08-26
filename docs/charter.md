# ChurnGuard — Project Charter & Business Requirements Document

## 1. Project Overview
**ChurnGuard** is a predictive machine learning system that identifies FinTech
customers (digital banking / neobank persona) at high risk of churn, so a
retention team can prioritize outreach before customers leave.

This is a **portfolio/showcase project** built to demonstrate end-to-end
ML engineering capability — from data pipeline through deployment — using
synthetic data with realistic, business-logic-driven signal.

## 2. Business Problem
Customer attrition directly erodes recurring revenue and increases customer
acquisition cost (CAC) needed to replace lost customers. Retention teams
today often react only *after* a customer has already left or shown
extreme disengagement (e.g., a closed account), rather than intervening
while the customer is still reachable.

## 3. Objectives
1. Predict the probability that a given customer will churn within the
   evaluation window.
2. Rank customers by risk so retention teams can prioritize the highest-value,
   highest-risk accounts first (Precision@Top-20% is the key business metric).
3. Provide **explainable** predictions — each flagged customer comes with the
   top factors driving their risk score, not just a black-box number.
4. Package the system as a deployable, monitored service — not just a notebook.

## 4. Target Users
| User | Need |
|---|---|
| Retention Analyst | Daily/weekly list of at-risk customers to contact |
| Business Stakeholder | High-level view of churn trends and model impact |
| ML/Platform Engineer | A maintainable, testable, deployable model service |

## 5. Success Metrics
| Metric | Target |
|---|---|
| Model AUC-ROC | ≥ 0.75 |
| Precision @ Top 20% risk | ≥ 0.60 (i.e., of the top 20% flagged, at least 60% actually churn) |
| API latency (p95, single prediction) | < 300ms |
| Test coverage on core pipeline | All critical paths covered |
| Estimated business impact | Framed as: "flagging the top 20% highest-risk customers for proactive outreach could address a majority of expected churn-related revenue loss" (illustrative, since this is a portfolio project on synthetic data) |

## 6. Scope

### In Scope (v1)
- Synthetic FinTech customer dataset with realistic churn signal
- Data validation and feature engineering pipeline
- Baseline + candidate ML models with documented comparison
- Explainability (SHAP) at both global and individual-customer level
- REST API for single and batch predictions
- Analyst-facing dashboard (risk overview, customer detail, model performance)
- Automated tests, including a model-quality CI gate
- Containerized deployment (Docker) with a documented deployment path
- Full documentation set (this charter, SRS, architecture, data dictionary, model card, runbook)

### Out of Scope (v1)
- Automated retention campaign triggering (e.g., auto-sending offers)
- Real-time streaming feature ingestion (v1 uses batch/synthetic data)
- Multi-tenant / multi-bank support
- Production-grade authentication & role-based access control (noted as a
  "next step" for real deployment)
- Live integration with a real core banking system

## 7. Assumptions
- Dataset is **synthetic**, generated to mimic realistic FinTech customer
  behavior patterns; it is not real customer data.
- "Churn" is defined as account closure/attrition within the modeled window,
  reduced to a binary label for v1.
- The project targets a portfolio/demo audience (recruiters, clients,
  technical reviewers) as well as functioning as a real, runnable system.

## 8. Risks
| Risk | Mitigation |
|---|---|
| Synthetic data may not generalize to real customer behavior | Clearly documented as synthetic in Model Card; pipeline is designed to be data-source-agnostic so real data can be substituted |
| Model performance degrades over time (drift) | Monitoring plan included in deployment runbook |
| Explainability outputs misinterpreted as causal | Model Card explicitly notes SHAP values show association/contribution, not proven causation |

## 9. High-Level Timeline
See Section 13 of the Project Blueprint (7-week milestone plan): Charter/SRS →
Data pipeline → Model development → MLOps packaging → API/Dashboard →
Testing/Deployment → Portfolio packaging.

## 10. Stakeholders (Portfolio Context)
| Role | Owner |
|---|---|
| Product / Project Lead | You / your team |
| ML Engineer | You / your team |
| Backend Engineer | You / your team |
| Frontend/Dashboard | You / your team |
| DevOps / Deployment | You / your team |

*(In a real company setting, these would map to distinct team members; for a
portfolio project, one person or a small team typically fills all roles —
which is itself worth calling out in the case study as full-stack ML capability.)*
