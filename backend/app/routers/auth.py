from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, HealthcareCoordinator
from ..schemas import LoginRequest, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or user.hashed_password != request.password:  # simple demo auth
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    return {
        "access_token": f"token-{user.id}-{int(datetime.utcnow().timestamp())}",
        "token_type": "bearer",
        "user": user
    }

@router.post("/demo-login", response_model=Token)
def demo_login(role: str = "coordinator", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.role == role).first()
    if not user:
        user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No demo users available.")

    return {
        "access_token": f"demo-token-{user.id}",
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(db: Session = Depends(get_db)):
    user = db.query(User).first()
    return user

