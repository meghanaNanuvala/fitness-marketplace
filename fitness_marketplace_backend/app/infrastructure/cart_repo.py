from app.domain.entities import CartItem
from typing import List
from pymongo.collection import Collection
from app.infrastructure.database import get_database

class MongoCartRepo:
    def __init__(self, db=None):
        if db is None:
            db = get_database()
        self.collection: Collection = db["cart"]

    async def add_item(self, item: CartItem):
        existing = await self.collection.find_one({
            "user_id": item.user_id,
            "product_id": item.product_id
        })

        if existing:
            new_qty = existing["quantity"] + item.quantity
            await self.collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"quantity": new_qty}}
            )
            return

        await self.collection.insert_one(item.__dict__)

    async def get_cart(self, user_id: str) -> list[CartItem]:
        cursor = self.collection.find({"user_id": user_id})
        docs = await cursor.to_list(100)

        items = []
        for d in docs:
            d.pop("_id", None)   # remove Mongo _id
            items.append(CartItem(**d))

        return items

    async def remove_item(self, user_id: str, product_id: str):
        await self.collection.delete_one({"user_id": user_id, "product_id": product_id})

    async def clear_cart(self, user_id: str):
        await self.collection.delete_many({"user_id": user_id})
