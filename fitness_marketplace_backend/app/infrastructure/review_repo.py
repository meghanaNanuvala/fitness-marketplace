# app/infrastructure/review_repo.py

from typing import Optional, List
from datetime import datetime
from app.domain.entities import Review
from app.domain.repositories import ReviewRepository
from app.config import settings


class MongoReviewRepo(ReviewRepository):
    def __init__(self, db):
        self.collection = db[settings.MONGO_REVIEWS_COLLECTION]

    async def create(self, review: Review) -> Review:
        doc = {
            "review_id": review.review_id,
            "purchase_id": review.purchase_id,
            "reviewer_user_id": review.reviewer_user_id,
            "reviewed_user_id": review.reviewed_user_id,
            "product_id": review.product_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at or datetime.utcnow(),
            "updated_at": review.updated_at,
        }
        await self.collection.insert_one(doc)
        return review

    async def get_by_id(self, review_id: str) -> Optional[Review]:
        doc = await self.collection.find_one({"review_id": review_id})
        return self._doc_to_review(doc) if doc else None

    async def get_by_purchase_id(self, purchase_id: str) -> Optional[Review]:
        doc = await self.collection.find_one({"purchase_id": purchase_id})
        return self._doc_to_review(doc) if doc else None

    async def list_by_seller(self, seller_user_id: str) -> List[Review]:
        cursor = self.collection.find({"reviewed_user_id": seller_user_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=None)
        return [self._doc_to_review(doc) for doc in docs]

    async def list_by_product(self, product_id: str) -> List[Review]:
        cursor = self.collection.find({"product_id": product_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=None)
        return [self._doc_to_review(doc) for doc in docs]

    async def list_by_reviewer(self, reviewer_user_id: str) -> List[Review]:
        cursor = self.collection.find({"reviewer_user_id": reviewer_user_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=None)
        return [self._doc_to_review(doc) for doc in docs]

    async def update(self, review_id: str, rating: int, comment: str) -> bool:
        result = await self.collection.update_one(
            {"review_id": review_id},
            {"$set": {"rating": rating, "comment": comment, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    async def delete(self, review_id: str) -> bool:
        result = await self.collection.delete_one({"review_id": review_id})
        return result.deleted_count > 0

    async def get_seller_average_rating(self, seller_user_id: str) -> Optional[float]:
        pipeline = [
            {"$match": {"reviewed_user_id": seller_user_id}},
            {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}},
        ]
        result = await self.collection.aggregate(pipeline).to_list(1)
        return round(result[0]["avg_rating"], 2) if result else None

    async def get_average_rating(self, product_id: str) -> Optional[float]:
        pipeline = [
            {"$match": {"product_id": product_id}},
            {"$group": {"_id": None, "avgRating": {"$avg": "$rating"}}},
        ]
        result = await self.collection.aggregate(pipeline).to_list(1)
        return round(result[0]["avgRating"], 2) if result else None

    async def get_seller_rating_stats(self, seller_user_id: str) -> dict:
        pipeline = [
            {"$match": {"reviewed_user_id": seller_user_id}},
            {
                "$group": {
                    "_id": None,
                    "avg_rating": {"$avg": "$rating"},
                    "total_reviews": {"$sum": 1},
                    "five_star": {"$sum": {"$cond": [{"$eq": ["$rating", 5]}, 1, 0]}},
                    "four_star": {"$sum": {"$cond": [{"$eq": ["$rating", 4]}, 1, 0]}},
                    "three_star": {"$sum": {"$cond": [{"$eq": ["$rating", 3]}, 1, 0]}},
                    "two_star": {"$sum": {"$cond": [{"$eq": ["$rating", 2]}, 1, 0]}},
                    "one_star": {"$sum": {"$cond": [{"$eq": ["$rating", 1]}, 1, 0]}},
                }
            },
        ]
        result = await self.collection.aggregate(pipeline).to_list(1)

        if result:
            stats = result[0]
            return {
                "average_rating": round(stats["avg_rating"], 2),
                "total_reviews": stats["total_reviews"],
                "rating_distribution": {
                    "5": stats["five_star"],
                    "4": stats["four_star"],
                    "3": stats["three_star"],
                    "2": stats["two_star"],
                    "1": stats["one_star"],
                },
            }

        return {
            "average_rating": None,
            "total_reviews": 0,
            "rating_distribution": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0},
        }

    def _doc_to_review(self, doc: dict) -> Review:
        return Review(
            review_id=doc["review_id"],
            purchase_id=doc["purchase_id"],
            reviewer_user_id=doc["reviewer_user_id"],
            reviewed_user_id=doc["reviewed_user_id"],
            product_id=doc["product_id"],
            rating=doc["rating"],
            comment=doc["comment"],
            created_at=doc["created_at"],
            updated_at=doc.get("updated_at"),
        )
