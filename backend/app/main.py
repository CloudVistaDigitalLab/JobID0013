from fastapi import FastAPI
from app.api.routes import user
from app.core.database import connect_to_mongo, close_mongo_connection

app = FastAPI(title="AI Initialized Study Plan App")

# Routers
app.include_router(user.router)

# Events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()
