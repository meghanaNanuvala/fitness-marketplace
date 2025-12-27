from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from app.infrastructure.review_repo import MongoReviewRepo
from app.infrastructure.purchase_repo import MongoPurchaseRepo
from app.application.use_cases import ReviewService
from app.db import db

router = APIRouter(prefix="/reviews", tags=["reviews"])


class CreateReviewRequest(BaseModel):
    purchase_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1, max_length=1000)


class UpdateReviewRequest(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=1, max_length=1000)


class ReviewResponse(BaseModel):
    review_id: str
    purchase_id: str
    reviewer_user_id: str
    reviewed_user_id: str
    product_id: str
    rating: int
    comment: str
    created_at: datetime
    updated_at: Optional[datetime] = None


def get_review_repo():
    return MongoReviewRepo(db)

def get_purchase_repo():
    return MongoPurchaseRepo(db)


async def get_current_user_id():
    return "current_user_id"


def get_review_service(
    review_repo = Depends(get_review_repo),
    purchase_repo = Depends(get_purchase_repo),
):
    return ReviewService(review_repo, purchase_repo)


@router.post("/add", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: CreateReviewRequest,
    user_id: str = Depends(get_current_user_id),
    review_service: ReviewService = Depends(get_review_service)
):
    result = await review_service.create_review(
        purchase_id=review_data.purchase_id,
        reviewer_user_id=user_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result["review"]


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: str,
    review_repo = Depends(get_review_repo),
):
    review = await review_repo.get_by_id(review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_data: UpdateReviewRequest,
    user_id: str = Depends(get_current_user_id),
    review_service: ReviewService = Depends(get_review_service)
):
    result = await review_service.update_review(
        review_id=review_id,
        user_id=user_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result["review"]


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    user_id: str = Depends(get_current_user_id),
    review_service: ReviewService = Depends(get_review_service)
):
    result = await review_service.delete_review(review_id, user_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])


@router.get("/seller/{seller_user_id}")
async def get_seller_reviews(
    seller_user_id: str,
    review_service: ReviewService = Depends(get_review_service)
):
    return await review_service.get_seller_reviews(seller_user_id)


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: str,
    review_repo = Depends(get_review_repo)
):
    return await review_repo.list_by_product(product_id)



@router.get("/product/{product_id}/average")
async def get_average_rating(product_id: str, review_repo = Depends(get_review_repo)):
    rating = await review_repo.get_average_rating(product_id)
    return {"average_rating": rating or 0}

