import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..deps import get_current_user

router = APIRouter()

ROOT = Path(__file__).resolve().parents[3]
MODEL_DIR = ROOT / "saved_models"

# Global state for active model
_active_model = "churn_pipeline.joblib"

@router.get("")
def list_models(current_user: User = Depends(get_current_user)):
    """List all available machine learning models in the saved_models directory."""
    models = []
    if MODEL_DIR.exists():
        for file in os.listdir(MODEL_DIR):
            if file.endswith(".joblib") and ("pipeline" in file or "model" in file):
                # Filter out scalar, etc. Keep actual models.
                if file not in ["scaler.joblib", "feature_columns.joblib"]:
                    models.append({
                        "filename": file,
                        "name": file.replace(".joblib", "").replace("_", " ").title(),
                        "size_bytes": os.path.getsize(MODEL_DIR / file),
                        "is_active": file == _active_model
                    })
    return {"models": models, "active_model": _active_model}

@router.post("/active")
def set_active_model(
    payload: dict,
    current_user: User = Depends(get_current_user)
):
    """Set the globally active machine learning model."""
    global _active_model
    model_filename = payload.get("model_filename")
    
    if not model_filename:
        raise HTTPException(status_code=400, detail="model_filename is required")
        
    model_path = MODEL_DIR / model_filename
    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Model file not found")
        
    _active_model = model_filename
    return {"status": "success", "active_model": _active_model}

def get_active_model_filename() -> str:
    return _active_model
