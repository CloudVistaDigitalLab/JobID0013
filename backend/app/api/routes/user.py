from fastapi import APIRouter, HTTPException
from app.models.user import User
from app.core.database import db
from bson import ObjectId

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=User)
async def create_user(user: User):
    user_dict = user.dict(exclude={"id"})
    result = await db["users"].insert_one(user_dict)
    user.id = str(result.inserted_id)
    return user

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(id=str(user["_id"]), name=user["name"], email=user["email"])