from fastapi import APIRouter, HTTPException, Depends
from app.models.user import User
from app.core.database import db
from app.utils.security import hash_password, verify_password
from bson import ObjectId
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["Users"])


# =====================
# Auth Models
# =====================
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str


# =====================
# Register
# =====================
@router.post("/register", response_model=User)
async def register(user: UserRegister):
    # Check if user exists
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_pw = hash_password(user.password)

    user_dict = {
        "name": user.name,
        "email": user.email,
        "password_hash": hashed_pw,
    }
    result = await db["users"].insert_one(user_dict)
    return User(id=str(result.inserted_id), name=user.name, email=user.email, password_hash=hashed_pw)


# =====================
# Login
# =====================
@router.post("/login")
async def login(credentials: UserLogin):
    user = await db["users"].find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful", "user_id": str(user["_id"])}


# =====================
# Get all users
# =====================
@router.get("/", response_model=List[User])
async def get_all_users():
    users = []
    async for user in db["users"].find():
        users.append(User(id=str(user["_id"]), name=user["name"], email=user["email"], password_hash=user["password_hash"]))
    return users


# =====================
# Get user by ID
# =====================
@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(id=str(user["_id"]), name=user["name"], email=user["email"], password_hash=user["password_hash"])


# =====================
# Update user
# =====================
class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, update: UserUpdate):
    update_dict = {k: v for k, v in update.dict().items() if v is not None}

    if "password" in update_dict:
        update_dict["password_hash"] = hash_password(update_dict.pop("password"))

    result = await db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found or no changes made")

    updated_user = await db["users"].find_one({"_id": ObjectId(user_id)})
    return User(id=str(updated_user["_id"]), name=updated_user["name"], email=updated_user["email"], password_hash=updated_user["password_hash"])


# =====================
# Delete user
# =====================
@router.delete("/{user_id}")
async def delete_user(user_id: str):
    result = await db["users"].delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
