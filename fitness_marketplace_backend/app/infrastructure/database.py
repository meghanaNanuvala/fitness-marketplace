from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

# Global client and database instances
mongo_client: AsyncIOMotorClient = None
mongo_db: AsyncIOMotorDatabase = None

async def connect_to_mongo():
    """Connect to MongoDB on startup"""
    global mongo_client, mongo_db
    mongo_client = AsyncIOMotorClient(settings.MONGO_URI)
    mongo_db = mongo_client[settings.MONGO_DB_NAME]
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("Closed MongoDB connection")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return mongo_db