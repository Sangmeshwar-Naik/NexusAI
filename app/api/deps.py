from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_access_token
from app.models.user import User

bearer = HTTPBearer(auto_error=False)

def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    subject = decode_access_token(credentials.credentials)
    if not subject:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.get(User, int(subject))
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user
