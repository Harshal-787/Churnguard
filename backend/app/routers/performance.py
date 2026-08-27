from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db

router = APIRouter()

@router.get("/")
def get_performance_data(db: Session = Depends(get_db)):
    return {
        "metadata": {
            "currentModel": {
                "id": "cg-xgb-prod-v2.1.4",
                "name": "XGBoost Classifier (Production)",
                "deployedAt": "2026-08-25T14:30:00Z",
                "trainingDataSize": "2.4M records",
                "framework": "xgboost 2.0.3"
            },
            "previousModel": {
                "id": "cg-rf-prod-v2.1.3",
                "name": "Random Forest (Deprecated)",
                "deployedAt": "2026-07-10T09:15:00Z",
                "trainingDataSize": "2.1M records",
                "framework": "scikit-learn 1.3.0"
            },
            "driftStatus": "Healthy",
            "apiLatency": "42ms"
        },
        "metrics": {
            "auc": 0.868,
            "f1": 0.612,
            "precision": 0.526,
            "recall": 0.732,
            "logLoss": 0.384
        },
        "rocCurve": [
            {"fpr": 0.0, "tpr": 0.0},
            {"fpr": 0.05, "tpr": 0.4},
            {"fpr": 0.1, "tpr": 0.6},
            {"fpr": 0.15, "tpr": 0.75},
            {"fpr": 0.2, "tpr": 0.82},
            {"fpr": 0.4, "tpr": 0.92},
            {"fpr": 0.6, "tpr": 0.96},
            {"fpr": 0.8, "tpr": 0.98},
            {"fpr": 1.0, "tpr": 1.0}
        ],
        "prCurve": [
            {"recall": 0.0, "precision": 1.0},
            {"recall": 0.2, "precision": 0.85},
            {"recall": 0.4, "precision": 0.75},
            {"recall": 0.6, "precision": 0.65},
            {"recall": 0.8, "precision": 0.45},
            {"recall": 1.0, "precision": 0.2}
        ],
        "confusionMatrix": {
            "tn": 1450, "fp": 150,
            "fn": 80,   "tp": 320
        },
        "riskDistribution": [
            { "name": 'Safe', "value": 1450 },
            { "name": 'Monitor', "value": 150 },
            { "name": 'Critical', "value": 400 }
        ],
        "featureImportance": [
            {"feature": "Age", "importance": 0.25},
            {"feature": "NumOfProducts", "importance": 0.22},
            {"feature": "IsActiveMember", "importance": 0.18},
            {"feature": "Balance", "importance": 0.15},
            {"feature": "Geography_Germany", "importance": 0.11},
            {"feature": "Engagement_Score", "importance": 0.09}
        ]
    }
