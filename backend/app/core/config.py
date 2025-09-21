from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "StudyPlanApp"
    MONGO_URI: str = "mongodb+srv://dbUser:4AWMFNm4t3eoB3vR@cluster0.c9ovb15.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    MONGO_DB: str = "test_db"

    class Config:
        env_file = ".env"  # you can keep sensitive configs in .env

settings = Settings()
