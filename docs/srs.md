# ChurnGuard — Software Requirements Specification (SRS)

## 1. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | The system shall generate/ingest customer data with a defined schema (see Data Dictionary). |
| FR-2 | The system shall validate incoming data against schema, null, range, and class-balance checks before use. |
| FR-3 | The system shall engineer features from raw customer data (engagement score, risk flags, etc.). |
| FR-4 | The system shall train and compare at least two model types (baseline + candidate) and select the best by AUC-ROC. |
| FR-5 | The system shall expose a REST API endpoint to predict churn probability for a single customer. |
| FR-6 | The system shall expose a REST API endpoint to predict churn probability for a batch of customers (JSON and CSV upload). |
| FR-7 | The system shall provide an explanation (top contributing factors) for any individual prediction. |
| FR-8 | The system shall expose model metadata (performance metrics, feature list) via API. |
| FR-9 | The system shall provide a dashboard for: (a) risk overview across all customers, (b) individual customer drill-down with explanation, (c) model performance view. |
| FR-10 | The system shall persist trained model artifacts (model, scaler, feature schema) for consistent reuse across API and dashboard. |

## 2. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 (Performance) | Single prediction API call should respond in < 300ms p95 under normal load. |
| NFR-2 (Scalability) | API should be stateless and horizontally scalable (no in-memory session state beyond the loaded model). |
| NFR-3 (Explainability) | Every individual prediction must be explainable via SHAP; explanations must reference actual model input features, not proxies. |
| NFR-4 (Reliability) | A `/health` endpoint must accurately report model-load status; the model-quality CI gate must block deployment of a model below minimum AUC/Precision@Top20% thresholds. |
| NFR-5 (Security/Privacy) | Since this represents FinTech customer data, real deployments must pseudonymize/anonymize PII before it reaches the pipeline; synthetic data is used in this project specifically to avoid handling real PII. |
| NFR-6 (Maintainability) | Feature engineering logic must live in one shared module (`build_features.py`) referenced identically by training, inference, and explanation code, to prevent train/serve skew. |
| NFR-7 (Testability) | Core pipeline (validation, feature engineering, model gate, API contract) must have automated test coverage runnable via a single `pytest` command. |
| NFR-8 (Portability) | The system must run both locally (via `uvicorn`/`streamlit`) and in containers (via Docker/Docker Compose) with no code changes. |

## 3. API Summary

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Service + model load status |
| `/model/metadata` | GET | Model performance metrics, feature list |
| `/predict` | POST | Single-customer churn prediction |
| `/predict/batch` | POST | Batch prediction (JSON list) |
| `/predict/batch/csv` | POST | Batch prediction (CSV upload) |
| `/explain` | POST | SHAP-based explanation for a single customer |

Full request/response schemas are auto-documented at `/docs` (Swagger UI) when
the API is running.

## 4. Data Flow Requirement Summary

```
Raw data → Validation → Feature Engineering → Model (train/infer) →
Explainability → API response / Dashboard render
```

Every stage must use the same feature engineering code path (see
`src/features/build_features.py` and `src/models/inference.py`) to guarantee
that what the model was trained on is exactly what it sees at inference time.
