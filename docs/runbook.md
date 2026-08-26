# ChurnGuard — Deployment Runbook

## 1. Local Development (no Docker)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Generate synthetic data
python src/data_pipeline/generate_data.py

# 3. Validate data quality
python src/data_pipeline/validate.py

# 4. Train the model (writes models/ and docs/model_card.md)
python src/models/train.py

# 5. Run tests
pytest tests/ -v

# 6. Start the API
uvicorn src.api.main:app --reload --port 8000
# Swagger docs: http://localhost:8000/docs

# 7. Start the dashboard (separate terminal)
streamlit run dashboard/app.py
# Dashboard: http://localhost:8501
```

## 2. Local Development (Docker Compose)

```bash
docker compose build
docker compose up
# API:       http://localhost:8000/docs
# Dashboard: http://localhost:8501
```

To stop: `docker compose down`

> Note: model artifacts (`models/`, `data/raw/`) are baked into the image at
> build time in this setup for simplicity. For faster iteration, mount them
> as volumes instead: add `volumes: ["./models:/app/models"]` under each
> service in `docker-compose.yml`.

## 3. Cloud Deployment (portfolio-scale options)

### Option A — Render / Railway (simplest, free-tier friendly)
1. Push the repo to GitHub.
2. Create two services from the same repo:
   - **Web Service** using `Dockerfile` → exposes the API on port 8000
   - **Web Service** using `Dockerfile.dashboard` → exposes the dashboard on port 8501
3. Set the dashboard's API base URL as an environment variable pointing to
   the deployed API's public URL (requires updating `dashboard/app.py` to
   call the API over HTTP instead of importing `ChurnPredictor` directly, if
   you want dashboard and API fully decoupled as separate services).
4. Trigger deploy — both platforms build directly from the Dockerfile.

### Option B — AWS (ECS Fargate)
1. Push both images to Amazon ECR.
2. Create an ECS Fargate service per image (API, dashboard), each with a
   target group behind an Application Load Balancer.
3. Store model artifacts in S3 and mount/pull at container startup if you
   want faster iteration without rebuilding images.

### Option C — GCP (Cloud Run)
1. `gcloud builds submit --tag gcr.io/PROJECT/churnguard-api`
2. `gcloud run deploy churnguard-api --image gcr.io/PROJECT/churnguard-api --port 8000`
3. Repeat for the dashboard image on a separate Cloud Run service.

## 4. Rollback Procedure
1. Identify the last known-good image tag (CI tags images with the Git SHA —
   see `.github/workflows/ci.yml`).
2. Redeploy that tag through your platform's console or CLI
   (`docker compose` : change the image tag and `up -d`; Cloud Run/ECS:
   redeploy the prior revision).
3. Confirm `/health` returns `{"model_loaded": true}` post-rollback.

## 5. Retraining Trigger Policy
- **Scheduled:** retrain monthly as a baseline cadence.
- **Event-driven:** retrain if monitoring detects data drift beyond an
  agreed threshold, or if live model performance (once real labels are
  available) drops below the CI gate thresholds in `tests/test_pipeline.py`
  (`test_model_meets_minimum_performance`).
- **Process:** re-run `python src/models/train.py` on fresh data → re-run
  `pytest tests/` → if the CI gate passes, promote the new model artifacts
  and rebuild/redeploy the API image.

## 6. Monitoring Recommendations (for a full production build)
- Track prediction volume, latency, and error rate on the API.
- Track input feature distributions over time vs. the training distribution
  (data drift) — Evidently AI is a good fit here.
- Track model performance metrics once ground-truth churn labels become
  available for scored customers (delayed feedback loop, common in churn
  prediction).
- Alert if drift or performance decay crosses a defined threshold, routing
  to the retraining trigger above.

## 7. Known Limitations of This Runbook
- This project runs in a sandboxed environment without a Docker daemon, so
  the Dockerfiles have been written to standard, well-tested patterns but
  not build-verified end-to-end here. **Recommended first step on your own
  machine:** `docker compose build` to confirm both images build cleanly
  before deploying further.
