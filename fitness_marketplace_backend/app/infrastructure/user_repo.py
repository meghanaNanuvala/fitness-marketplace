# app/infrastructure/user_repo.py
from typing import Optional, List
from app.domain.repositories import UserRepository
from app.domain.entities import User
from app.db import db


class MongoUserRepo(UserRepository):
    def __init__(self):
        self.collection = db.users
        self.counter_collection = db.counters
    
    async def _get_next_user_id(self) -> int:
        """Get next auto-incremented user ID."""
        result = await self.counter_collection.find_one_and_update(
            {"_id": "user_id"},
            {"$inc": {"sequence_value": 1}},
            upsert=True,
            return_document=True
        )
        
        if result is None:
            # Initialize counter if it doesn't exist
            await self.counter_collection.insert_one({
                "_id": "user_id",
                "sequence_value": 1
            })
            return 1
        
        return result["sequence_value"]
    
    async def create(
        self,
        name: str,
        email: str,
        username: str,
        password: str
    ) -> User:
        user_id = await self._get_next_user_id()
        user_id_str = str(user_id)
        
        user_doc = {
            "user_id": user_id_str,
            "name": name,
            "email": email,
            "username": username,
            "password": password  # Already hashed by use case
        }
        
        await self.collection.insert_one(user_doc)
        
        return User(
            user_id=user_id_str,
            name=name,
            email=email,
            username=username,
            password=password
        )
    
    async def get_by_id(self, user_id: str) -> Optional[User]:
        doc = await self.collection.find_one({"user_id": user_id})
        
        if not doc:
            return None
        
        return User(
            user_id=doc["user_id"],
            name=doc["name"],
            email=doc["email"],
            username=doc["username"],
            password=doc["password"]
        )
    
    async def get_by_username(self, username: str) -> Optional[User]:
        doc = await self.collection.find_one({"username": username})
        
        if not doc:
            return None
        
        return User(
            user_id=doc["user_id"],
            name=doc["name"],
            email=doc["email"],
            username=doc["username"],
            password=doc["password"],
            status = doc['status'],
            role = doc['status']
        )
    
    async def get_by_email(self, email: str) -> Optional[User]:
        doc = await self.collection.find_one({"email": email})
        
        if not doc:
            return None
        
        return User(
            user_id=doc["user_id"],
            name=doc["name"],
            email=doc["email"],
            username=doc["username"],
            password=doc["password"]
        )
    
    async def list_all(self) -> List[User]:
        cursor = self.collection.find({})
        users = []
        
        async for doc in cursor:
            users.append(User(
                user_id=doc["user_id"],
                name=doc["name"],
                email=doc["email"],
                username=doc["username"],
                password=doc["password"],
                status = doc['status'],
                role = doc['role']
            ))
        
        return users
    
    async def update_password(self, user_id: str, hashed_password: str) -> bool:
        result = await self.collection.update_one(
            {"user_id": user_id},
            {"$set": {"password": hashed_password}}
        )
        
        return result.modified_count > 0
    
    async def delete(self, user_id: str) -> bool:
        result = await self.collection.delete_one({"user_id": user_id})
        return result.deleted_count > 0
    

    async def update_status(self,user_id,new_status) -> bool:
        result = await self.collection.update_one({"user_id":user_id},{"$set": {"status":new_status}})
        return result.modified_count > 0