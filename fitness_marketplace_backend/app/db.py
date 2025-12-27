# app/db.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[settings.MONGO_DB_NAME]  # 👈 select DB explicitly
