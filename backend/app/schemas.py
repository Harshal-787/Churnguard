from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from .models import RoleEnum

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    organization_name: str
    role: Optional[RoleEnum] = RoleEnum.VIEWER

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: RoleEnum
    organization_id: int
    profile_picture_url: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"
    is_read: bool = False

class NotificationCreate(NotificationBase):
    user_id: Optional[int] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrgSettings(BaseModel):
    require_2fa: bool
    session_timeout: str

    class Config:
        from_attributes = True

class ApiKeyCreate(BaseModel):
    name: str

class ApiKeyResponse(BaseModel):
    id: int
    name: str
    preview: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApiKeyCreateResponse(ApiKeyResponse):
    key: str

class Verify2FA(BaseModel):
    email: EmailStr
    otp: str

class SearchCustomer(BaseModel):
    id: int
    customer_id: str
    geography: Optional[str] = None
    
    class Config:
        from_attributes = True

class SearchUser(BaseModel):
    id: int
    full_name: str
    email: str
    
    class Config:
        from_attributes = True

class SearchOrganization(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class SearchModel(BaseModel):
    id: int
    name: str
    version: str
    
    class Config:
        from_attributes = True

class SearchResponse(BaseModel):
    customers: list[SearchCustomer] = []
    users: list[SearchUser] = []
    organizations: list[SearchOrganization] = []
    models: list[SearchModel] = []
