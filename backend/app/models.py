from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class RoleEnum(str, enum.Enum):
    SUPER_ADMIN = "Super Admin"
    ORG_ADMIN = "Org Admin"
    DATA_ANALYST = "Data Analyst"
    VIEWER = "Viewer"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="organization")
    customers = relationship("Customer", back_populates="organization")
    models = relationship("Model", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.VIEWER, nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    profile_picture_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organization = relationship("Organization", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, index=True, nullable=False) # External ID from dataset
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Customer Data fields (to be expanded in Phase 2 for real dataset)
    geography = Column(String)
    age = Column(Integer)
    tenure_months = Column(Integer)
    num_products = Column(Integer)
    has_credit_card = Column(Integer)
    is_active_member = Column(Integer)
    avg_balance = Column(Float)
    monthly_transactions = Column(Integer)
    support_tickets_last_90d = Column(Integer)
    balance_trend_pct = Column(Float)
    days_since_last_login = Column(Integer)
    salary_band = Column(String)
    channel = Column(String)
    
    churned = Column(Integer, nullable=True) # Actual churn label
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    organization = relationship("Organization", back_populates="customers")
    predictions = relationship("PredictionHistory", back_populates="customer")

class Model(Base):
    __tablename__ = "models"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True) # Null for system-wide models
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    model_type = Column(String, nullable=False) # e.g. "xgboost", "logistic_regression"
    metrics = Column(JSON, nullable=True) # Store AUC, precision etc
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    organization = relationship("Organization", back_populates="models")
    predictions = relationship("PredictionHistory", back_populates="model")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_db_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    
    probability = Column(Float, nullable=False)
    prediction = Column(Integer, nullable=False)
    risk_tier = Column(String, nullable=False)
    top_factors = Column(JSON, nullable=True) # SHAP values
    llm_strategy = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    customer = relationship("Customer", back_populates="predictions")
    model = relationship("Model", back_populates="predictions")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    action = Column(String, nullable=False)
    endpoint = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")
    organization = relationship("Organization")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Null for broadcast
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info", nullable=False) # info, warning, success, error
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
