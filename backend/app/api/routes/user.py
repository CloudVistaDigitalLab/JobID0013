from fastapi import APIRouter, HTTPException, Depends, Request
from app.models.user import User, EmotionLog, UserRegister, UserLogin, EmotionCreate, UserUpdate, Habit, Task
from app.utils.security import hash_password, verify_password
from bson import ObjectId
from typing import List
from datetime import datetime, timedelta
import google.generativeai as genai

router = APIRouter(prefix="/users", tags=["Users"])

def get_db(request: Request):
    return request.app.state.db

moodEmojis = [
    { "emoji": "😮", "label": "Surprise" },
    { "emoji": "😢", "label": "Sad" },
    { "emoji": "😐", "label": "Neutral" },
    { "emoji": "😊", "label": "Happy" },
    { "emoji": "😨", "label": "Fear" },
    { "emoji": "🤢", "label": "Disgust" },
    { "emoji": "😡", "label": "Angry" }
]

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

# =====================
# HABITS
# =====================
@router.post("/{user_id}/habits")
async def add_habit(user_id: str, habit: Habit, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    habit_dict = habit.dict()
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"habits": habit_dict}}
    )
    return {"message": "Habit added successfully"}


@router.get("/{user_id}/habits", response_model=List[Habit])
async def get_habits(user_id: str, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.get("habits", [])


@router.get("/{user_id}/habits/{habit_id}", response_model=Habit)
async def get_habit(user_id: str, habit_id: str, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for h in user.get("habits", []):
        if h["habit_id"] == habit_id:
            return h
    raise HTTPException(status_code=404, detail="Habit not found")


@router.put("/{user_id}/habits/{habit_id}", response_model=Habit)
async def update_habit(user_id: str, habit_id: str, habit_update: Habit, db=Depends(get_db)):
    update_dict = {k: v for k, v in habit_update.dict().items() if v is not None}

    result = await db["users"].update_one(
        {"_id": ObjectId(user_id), "habits.habit_id": habit_id},
        {"$set": {f"habits.$.{k}": v for k, v in update_dict.items()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found or no changes made")

    updated_user = await db["users"].find_one({"_id": ObjectId(user_id)})
    for h in updated_user.get("habits", []):
        if h["habit_id"] == habit_id:
            return h


@router.patch("/{user_id}/habits/{habit_id}/status")
async def update_habit_status(user_id: str, habit_id: str, status: float, db=Depends(get_db)):
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id), "habits.habit_id": habit_id},
        {"$set": {"habits.$.progress": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit status updated successfully"}


@router.delete("/{user_id}/habits/{habit_id}")
async def delete_habit(user_id: str, habit_id: str, db=Depends(get_db)):
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"habits": {"habit_id": habit_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Habit deleted successfully"}


# =====================
# TASKS
# =====================
@router.post("/{user_id}/tasks")
async def add_task(user_id: str, task: Task, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    task_dict = task.dict()
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"tasks": task_dict}}
    )
    return {"message": "Task added successfully"}


@router.get("/{user_id}/tasks", response_model=List[Task])
async def get_tasks(user_id: str, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.get("tasks", [])


@router.get("/{user_id}/tasks/{task_id}", response_model=Task)
async def get_task(user_id: str, task_id: str, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for t in user.get("tasks", []):
        if t["task_id"] == task_id:
            return t
    raise HTTPException(status_code=404, detail="Task not found")


@router.put("/{user_id}/tasks/{task_id}", response_model=Task)
async def update_task(user_id: str, task_id: str, task_update: Task, db=Depends(get_db)):
    update_dict = {k: v for k, v in task_update.dict().items() if v is not None}

    result = await db["users"].update_one(
        {"_id": ObjectId(user_id), "tasks.task_id": task_id},
        {"$set": {f"tasks.$.{k}": v for k, v in update_dict.items()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found or no changes made")

    updated_user = await db["users"].find_one({"_id": ObjectId(user_id)})
    for t in updated_user.get("tasks", []):
        if t["task_id"] == task_id:
            return t


@router.patch("/{user_id}/tasks/{task_id}/status")
async def update_task_status(user_id: str, task_id: str, status: str, db=Depends(get_db)):
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id), "tasks.task_id": task_id},
        {"$set": {"tasks.$.status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task status updated successfully"}


@router.delete("/{user_id}/tasks/{task_id}")
async def delete_task(user_id: str, task_id: str, db=Depends(get_db)):
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"tasks": {"task_id": task_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# =====================
# Get Recommendations
# =====================
@router.get("/{user_id}/recommendations")
async def get_recommendations(user_id: str, db=Depends(get_db)):
    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Get last logged emotion
    emotion_logs = user.get("emotion_logs", [])
    if not emotion_logs:
        raise HTTPException(status_code=400, detail="No emotion logs found for user")
    last_emotion = emotion_logs[-1]  # take last entry
    emotion_value = last_emotion['emotion']
    emotion_source = last_emotion['source']

    if emotion_source == 'emoji':
        # Find the matching label for the emoji
        matched_mood = next((m for m in moodEmojis if m['emoji'] == emotion_value), None)
        if matched_mood:
            # Format: '😊 Happy'
            display_emotion = f"{matched_mood['emoji']} {matched_mood['label']}"
        else:
            # Fallback if the emoji value isn't found in the list
            display_emotion = emotion_value
    else:
        # For non-emoji sources (e.g., 'text' or 'api'), use the raw value
        display_emotion = emotion_value

    emotion_state = f"{display_emotion} (source: {emotion_source})"
    print(f"Last emotion for user {user_id}: {emotion_state}")

    # 2. Get pending tasks
    tasks = [t for t in user.get("tasks", []) if t.get("status") != "completed"]

    # 3. Get due habits for today
    today = datetime.utcnow().date()
    habits_due = []
    for h in user.get("habits", []):
        freq = h.get("frequency", "daily")
        if freq == "daily":
            habits_due.append(h)
        elif freq == "weekly" and today.weekday() == 0:  # Example: due on Monday
            habits_due.append(h)
        # You can expand for "custom" logic if needed

    # 4. Prepare prompt for Gemini
    prompt = f"""
    The user is currently feeling: {emotion_state}.
    Here are their pending tasks: {tasks}.
    Here are their due habits for today: {habits_due}.

    Based on the emotion and current state, recommend which tasks and habits
    they should focus on right now. Only return tasks and habits relevant
    to this emotion and helpful for productivity and mental well-being.

    Please respond in JSON format:
    {{
        "recommended_tasks": [...],
        "recommended_habits": [...]
    }}
    """

    # 5. Call Gemini
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)

    # 6. Parse Gemini response
    import json
    import re

    raw_text = response.text.strip()

    # Remove code block markers if present
    clean_text = re.sub(r"^```json\s*|\s*```$", "", raw_text, flags=re.DOTALL).strip()

    try:
        result = json.loads(clean_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini response parsing failed: {str(e)}")
    
    result["gemini_prompt"] = prompt 

    return result