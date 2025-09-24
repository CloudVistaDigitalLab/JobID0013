# app/core/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

async def connect_to_mongo(app):
    client = AsyncIOMotorClient(
        settings.MONGO_URI,
        tls=True,                        # ensure TLS is enabled
        tlsAllowInvalidCertificates=True # optional, helps if local OpenSSL causes handshake issues
    )
    app.state.db = client[settings.MONGO_DB]
    print("Using DB:", settings.MONGO_DB)
    print("Connected to MongoDB")

async def close_mongo_connection(app):
    app.state.db.client.close()
    print("Closed MongoDB connection")
