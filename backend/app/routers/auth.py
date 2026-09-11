from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import os
import shutil
import uuid
import random
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

from ..database import settings
from ..models import User, Organization, RoleEnum
from ..schemas import UserCreate, UserResponse, Token, Verify2FA
from ..auth import verify_password, get_password_hash, create_access_token
from ..deps import get_db, get_current_user
from datetime import timedelta

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

@router.post("/login")
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
        
    # Check 2FA policy
    if user.organization.require_2fa and user.role in [RoleEnum.VIEWER, RoleEnum.DATA_ANALYST]:
        otp = str(random.randint(100000, 999999))
        user.two_factor_code = otp
        user.two_factor_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        db.commit()
        
        try:
            resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": user.email,
                "subject": "Your ChurnGuard Login Code",
                "html": f"<p>Your 2FA login code is: <strong>{otp}</strong></p><p>This code expires in 10 minutes.</p>"
            })
        except Exception as e:
            print(f"Failed to send 2FA email: {e}")
            raise HTTPException(status_code=500, detail="Failed to send 2FA email")
            
        return {"requires_2fa": True, "email": user.email}
        
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value, "org": str(user.organization_id)}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/verify-2fa", response_model=Token)
def verify_2fa(payload: Verify2FA, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")
        
    if not user.two_factor_code or user.two_factor_code != payload.otp:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid code")
        
    # Check expiry (ensure datetime timezone aware comparison is safe)
    # Using simplistic check here assuming db saves aware datetimes
    if user.two_factor_expires_at:
        now = datetime.now(timezone.utc)
        expires = user.two_factor_expires_at
        if now > expires:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Code expired")
            
    # Success
    user.two_factor_code = None
    user.two_factor_expires_at = None
    db.commit()
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value, "org": str(user.organization_id)}, 
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
