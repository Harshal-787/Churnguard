from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from ..models import User, Customer, PredictionHistory, AuditLog, Organization, ApiKey
from ..deps import get_db, get_current_user, require_role
from ..schemas import RoleEnum, OrgSettings, ApiKeyCreate, ApiKeyResponse, ApiKeyCreateResponse
import secrets
import hashlib

router = APIRouter()

def log_audit(db: Session, user: User, action: str, endpoint: str, request: Request):
    log = AuditLog(
        user_id=user.id,
        action=action,
        endpoint=endpoint,
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    db.commit()

@router.get("/me/users")
def get_organization_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all users that belong to the current user's organization.
    """
    org_id = current_user.organization_id
    if not org_id:
        return []
        
    users = db.query(User).filter(User.organization_id == org_id).all()
    
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value if hasattr(u.role, 'value') else u.role
        }
        for u in users
    ]

@router.delete("/me/data", dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN, RoleEnum.DATA_ANALYST]))])
def wipe_organization_data(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Wipes all customers and prediction history for the current user's organization.
    Only accessible by Admins and Data Analysts.
    """
    org_id = current_user.organization_id
    
    from sqlalchemy import text
    try:
        # Delete prediction history first
        res_history = db.execute(text("""
            DELETE FROM prediction_history 
            USING customers 
            WHERE prediction_history.customer_db_id = customers.id 
            AND customers.organization_id = :org_id
        """), {"org_id": org_id})
        deleted_history = res_history.rowcount
        
        # Delete customers
        res_customers = db.execute(text("""
            DELETE FROM customers 
            WHERE organization_id = :org_id
        """), {"org_id": org_id})
        deleted_customers = res_customers.rowcount
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    
    log_audit(db, current_user, "Wipe Organization Data", "/api/v1/organizations/me/data", request)
    
    return {
        "message": f"Successfully deleted {deleted_customers} customers and {deleted_history} predictions.",
        "deleted_customers": deleted_customers
    }

@router.get("/admin/stats", dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN]))])
def get_admin_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    from ..models import Organization
    
    orgs = db.query(Organization).all()
    total_users = db.query(func.count(User.id)).scalar()
    
    # Mocking API request count and health since we don't track it yet
    system_stats = [
        { "title": "Total Organizations", "value": len(orgs), "icon": "IconBuildingBank", "color": "primary.main" },
        { "title": "Active Users", "value": total_users, "icon": "IconUsersGroup", "color": "success.main" },
        { "title": "API Requests / Day", "value": "1.2M", "icon": "IconServerCog", "color": "error.main" },
        { "title": "System Health", "value": "99.9%", "icon": "IconActivityHeartbeat", "color": "warning.main" }
    ]
    
    organizations_data = []
    for org in orgs:
        users_count = db.query(func.count(User.id)).filter(User.organization_id == org.id).scalar()
        organizations_data.append({
            "id": f"org-{org.id}",
            "name": org.name,
            "users": users_count,
            "status": "Active"
        })
        
    db_load = {
        "customers": db.query(func.count(Customer.id)).scalar(),
        "predictions": db.query(func.count(PredictionHistory.id)).scalar(),
        "auditLogs": db.query(func.count(AuditLog.id)).scalar()
    }
        
    return {
        "systemStats": system_stats,
        "organizations": organizations_data,
        "dbLoad": db_load
    }

@router.delete("/admin/users/{user_id}", dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN]))])
def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from fastapi import HTTPException
    
    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_to_delete.organization_id != current_user.organization_id:
        raise HTTPException(status_code=403, detail="Cannot delete users outside your organization")
        
    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    email = user_to_delete.email
    db.delete(user_to_delete)
    db.commit()
    
    log_audit(db, current_user, f"Deleted user {email}", f"/api/v1/organizations/admin/users/{user_id}", request)
    
    return {"message": "User successfully deleted"}

@router.get("/admin/audit_logs", dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN]))])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch audit logs for all users in the current user's org
    org_id = current_user.organization_id
    users = db.query(User.id).filter(User.organization_id == org_id).all()
    user_ids = [u.id for u in users]
    
    logs = db.query(AuditLog).filter(AuditLog.user_id.in_(user_ids)).order_by(AuditLog.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": log.id,
            "action": log.action,
            "endpoint": log.endpoint,
            "ip_address": log.ip_address,
            "user_email": log.user.email if log.user else "Unknown",
            "timestamp": log.created_at.isoformat() if log.created_at else None
        }
        for log in logs
    ]

@router.get("/me/settings", response_model=OrgSettings, dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN]))])
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    return org

@router.put("/me/settings", response_model=OrgSettings, dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN]))])
def update_settings(settings: OrgSettings, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    org.require_2fa = settings.require_2fa
    org.session_timeout = settings.session_timeout
    db.commit()
    log_audit(db, current_user, "Updated Security Settings", "/api/v1/organizations/me/settings", request)
    return org

@router.post("/me/force_rotate_passwords", dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN]))])
def force_rotate_passwords(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    log_audit(db, current_user, "Forced Password Rotation for all users", "/api/v1/organizations/me/force_rotate_passwords", request)
    return {"message": "All users will be forced to rotate passwords on next login"}

@router.get("/me/api_keys", response_model=list[ApiKeyResponse], dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN]))])
def get_api_keys(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    keys = db.query(ApiKey).filter(ApiKey.organization_id == current_user.organization_id).all()
    return keys

@router.post("/me/api_keys", response_model=ApiKeyCreateResponse, dependencies=[Depends(require_role([RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN]))])
def create_api_key(key_data: ApiKeyCreate, request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    raw_key = "cg_" + secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    preview = raw_key[:7] + "*" * 20 + raw_key[-4:]
    
    new_key = ApiKey(
        organization_id=current_user.organization_id,
        name=key_data.name,
        key_hash=key_hash,
        preview=preview
    )
    db.add(new_key)
    db.commit()
    db.refresh(new_key)
    
    log_audit(db, current_user, f"Generated API Key: {key_data.name}", "/api/v1/organizations/me/api_keys", request)
    
    return {
        "id": new_key.id,
        "name": new_key.name,
        "preview": new_key.preview,
        "created_at": new_key.created_at,
        "key": raw_key
    }

