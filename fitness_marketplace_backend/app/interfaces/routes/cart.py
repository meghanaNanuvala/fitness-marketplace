from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.infrastructure.cart_repo import MongoCartRepo
from app.infrastructure.item_repo import MongoItemRepo
from app.interfaces.schemas import CartItemIn, CartItemOut
from app.application.cart import (
    AddToCart, GetCart, RemoveFromCart, ClearCart
)

router = APIRouter(prefix="/api/v1/cart", tags=["Cart"])


def cart_repo() -> MongoCartRepo:
    from app.infrastructure.database import get_database
    return MongoCartRepo(get_database())


def item_repo() -> MongoItemRepo:
    from app.infrastructure.database import get_database
    return MongoItemRepo(get_database())


@router.post("/{user_id}", response_model=CartItemOut)
async def add_cart_item(
        user_id: str,
        item: CartItemIn,
        c_repo: MongoCartRepo = Depends(cart_repo),
        i_repo: MongoItemRepo = Depends(item_repo)
):
    uc = AddToCart(c_repo, i_repo)
    result, err = await uc.execute(user_id, item.productId, item.quantity)

    if err:
        raise HTTPException(400, err)

    return CartItemOut(
        userId=result.user_id,
        productId=result.product_id,
        productName=result.product_name,
        priceCents=result.price_cents,
        quantity=result.quantity,
        sellerUserId=result.seller_user_id,
        photo=result.photo
    )


@router.get("/{user_id}", response_model=List[CartItemOut])
async def get_cart(user_id: str, repo: MongoCartRepo = Depends(cart_repo)):
    uc = GetCart(repo)
    items = await uc.execute(user_id)
    return [
        CartItemOut(
            userId=i.user_id,
            productId=i.product_id,
            productName=i.product_name,
            priceCents=i.price_cents,
            quantity=i.quantity,
            sellerUserId=i.seller_user_id,
            photo=i.photo
        )
        for i in items
    ]


@router.delete("/{user_id}/{product_id}")
async def remove_item(user_id: str, product_id: str, repo: MongoCartRepo = Depends(cart_repo)):
    uc = RemoveFromCart(repo)
    await uc.execute(user_id, product_id)
    return {"ok": True}


@router.delete("/{user_id}")
async def clear_cart(user_id: str, repo: MongoCartRepo = Depends(cart_repo)):
    uc = ClearCart(repo)
    await uc.execute(user_id)
    return {"ok": True}
