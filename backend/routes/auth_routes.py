from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from auth import hash_password, verify_password, create_token
from database import get_user, create_user

router = APIRouter()

class AuthRequest(BaseModel):
    username: str
    password: str

@router.post("/auth/signup")
async def signup(req: AuthRequest):
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    hashed = hash_password(req.password)
    success = create_user(req.username, hashed)
    
    if not success:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    token = create_token({"sub": req.username})
    return {"token": token, "username": req.username, "message": "Account created successfully"}

@router.post("/auth/login")
async def login(req: AuthRequest):
    user = get_user(req.username)
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_token({"sub": req.username})
    return {"token": token, "username": req.username, "message": "Login successful"}