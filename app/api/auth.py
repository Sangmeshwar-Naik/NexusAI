from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import RegisterIn, LoginIn, TokenOut, UserOut
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenOut, status_code=201)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise HTTPException(422, "Password must contain at least 8 characters")
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(409, "An account with this email already exists")
    user = User(name=payload.name.strip(), email=payload.email.lower(), password_hash=hash_password(payload.password))
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token": create_access_token(str(user.id)), "user": user}

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return {"access_token": create_access_token(str(user.id)), "user": user}

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user
