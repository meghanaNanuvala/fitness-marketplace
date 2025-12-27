from typing import Optional, List
from datetime import datetime
from app.domain.entities import Purchase
from app.domain.repositories import PurchaseRepository
from app.config import settings

class MongoPurchaseRepo(PurchaseRepository):
    def __init__(self, db):
        self.collection = db[settings.MONGO_PURCHASES_COLLECTION]

    async def create(self, purchase: Purchase) -> Purchase:
        doc = {
            "purchase_id": purchase.purchase_id,
            "buyer_user_id": purchase.buyer_user_id,
            "seller_user_id": purchase.seller_user_id,
            "product_id": purchase.product_id,
            "product_name": purchase.product_name,
            "quantity": purchase.quantity,
            "total_price_cents": purchase.total_price_cents,
            "purchase_date": purchase.purchase_date,
            "status": purchase.status,
            "photo": purchase.photo  # 🔥 store image
        }
        await self.collection.insert_one(doc)
        return purchase

    async def get_by_id(self, purchase_id: str) -> Optional[Purchase]:
        doc = await self.collection.find_one({"purchase_id": purchase_id})
        if not doc:
            return None
        return Purchase(
            purchase_id=doc["purchase_id"],
            buyer_user_id=doc["buyer_user_id"],
            seller_user_id=doc["seller_user_id"],
            product_id=doc["product_id"],
            product_name=doc["product_name"],
            quantity=doc["quantity"],
            total_price_cents=doc["total_price_cents"],
            purchase_date=doc["purchase_date"],
            status=doc["status"],
            photo=doc.get("photo")
        )

    async def list_by_buyer(self, buyer_user_id: str) -> List[Purchase]:
        cursor = self.collection.find({"buyer_user_id": buyer_user_id})
        docs = await cursor.to_list(length=None)
        return [
            Purchase(
                purchase_id=doc["purchase_id"],
                buyer_user_id=doc["buyer_user_id"],
                seller_user_id=doc["seller_user_id"],
                product_id=doc["product_id"],
                product_name=doc["product_name"],
                quantity=doc["quantity"],
                total_price_cents=doc["total_price_cents"],
                purchase_date=doc["purchase_date"],
                status=doc["status"],
                photo=doc.get("photo")
            )
            for doc in docs
        ]

    async def list_by_seller(self, seller_user_id: str) -> List[Purchase]:
        cursor = self.collection.find({"seller_user_id": seller_user_id})
        docs = await cursor.to_list(length=None)
        return [
            Purchase(
                purchase_id=doc["purchase_id"],
                buyer_user_id=doc["buyer_user_id"],
                seller_user_id=doc["seller_user_id"],
                product_id=doc["product_id"],
                product_name=doc["product_name"],
                quantity=doc["quantity"],
                total_price_cents=doc["total_price_cents"],
                purchase_date=doc["purchase_date"],
                status=doc["status"],
                photo=doc.get("photo")
            )
            for doc in docs
        ]

    async def update_status(self, purchase_id: str, status: str) -> bool:
        result = await self.collection.update_one(
            {"purchase_id": purchase_id},
            {"$set": {"status": status}}
        )
        return result.modified_count > 0
