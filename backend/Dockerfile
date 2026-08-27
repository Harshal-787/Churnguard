FROM python:3.12-slim

WORKDIR /app

# System deps kept minimal; xgboost/shap need libgomp at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
# Also need ML requirements for inference? Yes, predictor needs xgboost etc.
# Wait, let's just copy both or assume backend/requirements.txt has everything.
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app
COPY backend/app/ ./app/
COPY backend/alembic/ ./alembic/
COPY backend/alembic.ini ./

# Copy ml and saved_models for inference
COPY ml/ ./ml/
COPY saved_models/ ./saved_models/

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
