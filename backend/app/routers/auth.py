from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import shutil
import uuid

from ..database import settings
from ..models import User, Organization, RoleEnum
from ..schemas import UserCreate, UserResponse, Token
from ..auth import verify_password, get_password_hash, create_access_token
from ..deps import get_db, get_current_user

router = APIRouter()

UPLOAD_DIR = "uploads/profiles"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    organization_name: str = Form(...),
    role: RoleEnum = Form(RoleEnum.VIEWER),
    profile_picture: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Check if user exists
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Get or create organization
    org = db.query(Organization).filter(Organization.name == organization_name).first()
    if not org:
        org = Organization(name=organization_name)
        db.add(org)
        db.flush() # flush to get org.id
        
    # Handle Profile Picture Upload
    profile_picture_url = None
    if profile_picture:
        file_ext = profile_picture.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_picture.file, buffer)
            
        profile_picture_url = f"/static/profiles/{unique_filename}"
        
    hashed_password = get_password_hash(password)
    new_user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        organization_id=org.id,
        role=role,
        profile_picture_url=profile_picture_url
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value, "org": str(user.organization_id)}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
