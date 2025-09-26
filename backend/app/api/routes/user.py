from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.user import User, EmotionLog, UserRegister, UserLogin, EmotionCreate, UserUpdate
from app.utils.security import hash_password, verify_password
from bson import ObjectId
from typing import List
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])

def get_db(request: Request):
    return request.app.state.db

# =====================
# Register
# =====================
@router.post("/register", response_model=User)
async def register(user: UserRegister, db=Depends(get_db)):
    print("Registering user:", user.email)
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
    print("Inserting user into DB:", user_dict)
    result = await db["users"].insert_one(user_dict)
    print("User registered with ID:", result.inserted_id)
    return User(id=str(result.inserted_id), name=user.name, email=user.email, password_hash=hashed_pw)


# =====================
# Login
# =====================
@router.post("/login")
async def login(credentials: UserLogin, db=Depends(get_db)):
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
async def get_all_users(db=Depends(get_db)):
    users = []
    async for user in db["users"].find():
        users.append(User(id=str(user["_id"]), name=user["name"], email=user["email"], password_hash=user["password_hash"]))
    return users


# =====================
# Get user by ID
# =====================
@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(id=str(user["_id"]), name=user["name"], email=user["email"], password_hash=user["password_hash"])


# =====================
# Update user
# =====================
@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, update: UserUpdate, db=Depends(get_db)):
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
async def delete_user(user_id: str, db=Depends(get_db)):
    result = await db["users"].delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


# =====================
# Log emotion
# =====================
@router.post("/{user_id}/emotions")
async def log_emotion(user_id: str, emotion: EmotionCreate, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_log = EmotionLog(
        timestamp=datetime.utcnow(),
        emotion=emotion.emotion,
        source=emotion.source
    )

    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"emotion_logs": new_log.dict()}}
    )

    return {"message": "Emotion logged successfully"}