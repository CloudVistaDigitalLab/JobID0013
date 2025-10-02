from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class EmotionLog(BaseModel):
    timestamp: datetime
    emotion: str
    source: str  # AI, self-report, emoji

class Habit(BaseModel):
    habit_id: str
    title: str
    description: Optional[str] = None
    frequency: str  # daily/weekly/custom
    progress: float = 0.0

class Task(BaseModel):
    task_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: str = "pending"  # pending, ongoing, completed, skipped

class PerformanceReport(BaseModel):
    period: str  # e.g., "2025-09-week3"
    tasks_completed: int
    tasks_missed: int
    emotions_summary: dict

class DailyRecommendation(BaseModel):
    date: datetime  # store only date part (UTC)
    recommended_tasks: List[Task] = []
    recommended_habits: List[Habit] = []

class User(BaseModel):
    id: Optional[str]
    name: str
    email: EmailStr
    password_hash: str
    role: str = "student"
    university: Optional[str] = None
    course_of_study: Optional[str] = None
    year_of_study: Optional[int] = None
    emotion_logs: List[EmotionLog] = []
    habits: List[Habit] = []
    tasks: List[Task] = []
    performance_reports: List[PerformanceReport] = []
    daily_recommendations: List[DailyRecommendation] = []
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class EmotionCreate(BaseModel):
    emotion: str
    source: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None