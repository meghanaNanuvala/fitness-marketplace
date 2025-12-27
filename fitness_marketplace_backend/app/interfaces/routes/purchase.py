# app/interfaces/routes/purchase.py
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from app.application.use_cases import (
    PurchaseItem,
    GetPurchasesByBuyer,
    GetPurchasesBySeller,
    GetPurchaseById
)
from app.infrastructure.purchase_repo import MongoPurchaseRepo
from app.infrastructure.item_repo import MongoItemRepo
from app.infrastructure.database import get_database
from app.interfaces.schemas import PurchaseIn, PurchaseOut

router = APIRouter(prefix="/api/v1/purchases", tags=["Purchases"])


# Dependencies
def purchase_repo() -> MongoPurchaseRepo:
    return MongoPurchaseRepo(get_database())

def item_repo() -> MongoItemRepo:
    return MongoItemRepo(get_database())


@router.post("/{buyer_user_id}", response_model=PurchaseOut, status_code=status.HTTP_201_CREATED)
async def create_purchase(
    buyer_user_id: str,
    purchase_data: PurchaseIn,
    p_repo: MongoPurchaseRepo = Depends(purchase_repo),
    i_repo: MongoItemRepo = Depends(item_repo)
):
    try:
        uc = PurchaseItem(p_repo, i_repo)
        result = await uc.execute(
            buyer_user_id=buyer_user_id,
            product_id=purchase_data.productId,
            quantity=purchase_data.quantity
        )

        if result.error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.error
            )

        return PurchaseOut(
            purchaseId=result.purchase.purchase_id,
            buyerUserId=result.purchase.buyer_user_id,
            sellerUserId=result.purchase.seller_user_id,
            productId=result.purchase.product_id,
            productName=result.purchase.product_name,
            quantity=result.purchase.quantity,
            totalPriceCents=result.purchase.total_price_cents,
            purchaseDate=result.purchase.purchase_date,
            status=result.purchase.status
        )

    except HTTPException:
        # rethrow expected errors
        raise

    except Exception as e:
        # unexpected server error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )



@router.get("/buyer/{buyer_user_id}", response_model=List[PurchaseOut])
async def get_buyer_purchases(
    buyer_user_id: str,
    repo: MongoPurchaseRepo = Depends(purchase_repo)
):
    """Get all purchases made by a specific buyer"""
    uc = GetPurchasesByBuyer(repo)
    purchases = await uc.execute(buyer_user_id=buyer_user_id)
    
    return [
        PurchaseOut(
            purchaseId=p.purchase_id,
            buyerUserId=p.buyer_user_id,
            sellerUserId=p.seller_user_id,
            productId=p.product_id,
            productName=p.product_name,
            quantity=p.quantity,
            totalPriceCents=p.total_price_cents,
            purchaseDate=p.purchase_date,
            status=p.status
        )
        for p in purchases
    ]


@router.get("/seller/{seller_user_id}", response_model=List[PurchaseOut])
async def get_seller_sales(
    seller_user_id: str,
    repo: MongoPurchaseRepo = Depends(purchase_repo)
):
    """Get all sales (purchases) for a specific seller"""
    uc = GetPurchasesBySeller(repo)
    purchases = await uc.execute(seller_user_id=seller_user_id)
    
    return [
        PurchaseOut(
            purchaseId=p.purchase_id,
            buyerUserId=p.buyer_user_id,
            sellerUserId=p.seller_user_id,
            productId=p.product_id,
            productName=p.product_name,
            quantity=p.quantity,
            totalPriceCents=p.total_price_cents,
            purchaseDate=p.purchase_date,
            status=p.status
        )
        for p in purchases
    ]


@router.get("/{purchase_id}", response_model=PurchaseOut)
async def get_purchase(
    purchase_id: str,
    repo: MongoPurchaseRepo = Depends(purchase_repo)
):
    """Get a specific purchase by ID"""
    uc = GetPurchaseById(repo)
    purchase = await uc.execute(purchase_id=purchase_id)
    
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Purchase not found"
        )
    
    return PurchaseOut(
        purchaseId=purchase.purchase_id,
        buyerUserId=purchase.buyer_user_id,
        sellerUserId=purchase.seller_user_id,
        productId=purchase.product_id,
        productName=purchase.product_name,
        quantity=purchase.quantity,
        totalPriceCents=purchase.total_price_cents,
        purchaseDate=purchase.purchase_date,
        status=purchase.status
    )