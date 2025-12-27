from typing import Iterable, Optional, List
from app.domain.repositories import ItemRepo
from app.domain.entities import Item
from app.db import db
from app.config import settings
from motor.motor_asyncio import AsyncIOMotorDatabase

class MongoItemRepo(ItemRepo):
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db[settings.MONGO_ITEMS_COLLECTION]

    def _doc_to_item(self, doc: dict) -> Item:
        return Item(
            product_id=doc.get("productId"),
            product_name=doc.get("productName"),
            category=doc.get("category"),
            photos=doc.get("photos", []),
            price_cents=doc.get("priceCents"),
            qty=doc.get("qty"),
            description=doc.get("description"),
            is_seller=doc.get("isSeller"),
            owner_user_id=doc.get("ownerUserId"),
            avg_rating=round(doc.get("avgRating", 0) or 0, 1)  # added
        )

    def _item_to_doc(self, item: Item) -> dict:
        return {
            "productId": item.product_id,
            "productName": item.product_name,
            "category": item.category,
            "photos": item.photos,
            "priceCents": item.price_cents,
            "qty": item.qty,
            "description": item.description,
            "isSeller": item.is_seller,
            "ownerUserId": item.owner_user_id,
        }

    async def create(self, item: Item) -> Item:
        doc = self._item_to_doc(item)
        await self.collection.insert_one(doc)
        return item

    async def get_by_id(self, product_id: str) -> Optional[Item]:
        doc = await self.collection.find_one({"productId": product_id})
        if not doc:
            return None
        return self._doc_to_item(doc)

    async def list(self, *, is_seller: Optional[bool] = None, category: Optional[str] = None) -> List[Item]:
        query = {}
        if is_seller is not None:
            query["isSeller"] = is_seller
        if category:
            query["category"] = category

        pipeline = [
            {"$match": query},
            {
                "$lookup": {
                    "from": "reviews",
                    "localField": "productId",
                    "foreignField": "product_id",
                    "as": "reviews"
                }
            },
            {
                "$addFields": {
                    "avgRating": {"$avg": "$reviews.rating"}
                }
            }
        ]

        cursor = self.collection.aggregate(pipeline)
        docs = await cursor.to_list(length=None)
        return [self._doc_to_item(doc) for doc in docs]

    async def list_by_owner(self, owner_user_id: str) -> List[Item]:
        cursor = self.collection.find({"ownerUserId": owner_user_id})
        docs = await cursor.to_list(length=None)
        return [self._doc_to_item(doc) for doc in docs]

    async def update_quantity(self, product_id: str, new_qty: int) -> bool:
        result = await self.collection.update_one(
            {"productId": product_id},
            {"$set": {"qty": new_qty}}
        )
        return result.modified_count > 0
