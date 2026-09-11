from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

from ..database import get_db
from ..models import User, Customer, Organization, Model, RoleEnum
from ..deps import get_current_user
from ..schemas import SearchResponse

router = APIRouter()

@router.get("/", response_model=SearchResponse)
def search_global(q: str = "", db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q_term = f"%{q}%"
    response = SearchResponse(customers=[], users=[], organizations=[], models=[])
    
    if not q:
        return response
        
    is_super_admin = current_user.role == RoleEnum.SUPER_ADMIN
    is_org_admin = current_user.role in [RoleEnum.SUPER_ADMIN, RoleEnum.ORG_ADMIN]
    
    # 1. Search Customers (All roles can search their org's customers. Super admin searches all)
    cust_query = db.query(Customer).filter(Customer.customer_id.ilike(q_term))
    if not is_super_admin:
        cust_query = cust_query.filter(Customer.organization_id == current_user.organization_id)
    response.customers = cust_query.limit(5).all()

    # 2. Search Models (All roles can search models in their org)
    model_query = db.query(Model).filter(Model.name.ilike(q_term))
    if not is_super_admin:
        model_query = model_query.filter(or_(Model.organization_id == current_user.organization_id, Model.organization_id == None))
    response.models = model_query.limit(5).all()

    # 3. Search Users (Only Admins)
    if is_org_admin:
        user_query = db.query(User).filter(or_(User.email.ilike(q_term), User.full_name.ilike(q_term)))
        if not is_super_admin:
            user_query = user_query.filter(User.organization_id == current_user.organization_id)
        response.users = user_query.limit(5).all()

    # 4. Search Organizations (Only Super Admin)
    if is_super_admin:
        response.organizations = db.query(Organization).filter(Organization.name.ilike(q_term)).limit(5).all()

    return response
