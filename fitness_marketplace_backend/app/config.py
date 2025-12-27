from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # --- MongoDB Configuration ---
    MONGO_URI: str = Field(
        default="mongodb+srv://marketplace:abcd1234@cluster0.n4tvq3v.mongodb.net/fitness_marketplace?retryWrites=true&w=majority",
        description="Connection URI for MongoDB cluster or local instance."
    )
    MONGO_DB_NAME: str = Field(
        default="fitness_marketplace",
        description="Database name for the fitness marketplace."
    )
    
    # --- Collection Names ---
    MONGO_USERS_COLLECTION: str = "users"
    MONGO_ITEMS_COLLECTION: str = "items"
    # in settings.py
    MONGO_PURCHASES_COLLECTION: str = "purchases"
    MONGO_REVIEWS_COLLECTION: str = "reviews"


    
    # --- File uploads ---
    UPLOAD_DIR: str = "uploads"
    PUBLIC_PREFIX: str = "/uploads"
    
    # --- Security / JWT ---
    SECRET_KEY: str = Field(default="your-super-secret-key-change-this-in-production")
    ALGORITHM: str = "HS256"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()