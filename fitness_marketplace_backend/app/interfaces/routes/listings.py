from fastapi import APIRouter, UploadFile, File, Form, Query, Depends, HTTPException
from typing import Optional, List
from datetime import datetime

from app.application.use_cases import CreateItem, ListItems, ListItemsByOwner
from app.infrastructure.item_repo import MongoItemRepo
from app.infrastructure.local_storage_service import LocalStorageService
from app.interfaces.schemas import ItemOut
from app.db import db
from app.config import settings
import logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/listings", tags=["Listings"])

def item_repo() -> MongoItemRepo:
    return MongoItemRepo(db=db)

def storage() -> LocalStorageService:
    return LocalStorageService()


@router.post("", response_model=ItemOut)
async def create_listing(
    productId: str = Form(...),
    productName: str = Form(...),
    category: str = Form(...),
    priceCents: int = Form(...),
    qty: int = Form(1),
    ownerUserId: str = Form(...),
    isSeller: bool = Form(True),
    description: Optional[str] = Form(None),
    photos: List[UploadFile] = File(default=[]),
    repo: MongoItemRepo = Depends(item_repo),
    store: LocalStorageService = Depends(storage),
):
    contents = [await f.read() for f in photos]
    names = [f.filename for f in photos]

    uc = CreateItem(repo, store)
    created = await uc.execute(
        product_id=productId,
        product_name=productName,
        category=category,
        price_cents=priceCents,
        qty=qty,
        owner_user_id=ownerUserId,
        is_seller=isSeller,
        description=description,
        files=contents,
        filenames=names,
    )
    return ItemOut(
        productId=created.product_id,
        productName=created.product_name,
        category=created.category,
        priceCents=created.price_cents,
        qty=created.qty,
        ownerUserId=created.owner_user_id,
        isSeller=created.is_seller,
        description=created.description,
        photos=created.photos,
        avgRating=0
    )


@router.get("", response_model=list[ItemOut])
async def list_listings(
    isSeller: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    repo: MongoItemRepo = Depends(item_repo),
):
    items = await repo.list(is_seller=isSeller, category=category)

    return [
        ItemOut(
            productId=i.product_id,
            productName=i.product_name,
            category=i.category,
            priceCents=i.price_cents,
            qty=i.qty,
            ownerUserId=i.owner_user_id,
            isSeller=i.is_seller,
            description=i.description,
            photos=i.photos,
            avgRating=getattr(i, "avg_rating", 0)
        )
        for i in items
    ]


@router.get("/{productId}", response_model=ItemOut)
async def get_item(productId: str, repo: MongoItemRepo = Depends(item_repo)):
    items = await repo.list()
    for i in items:
        if i.product_id == productId:
            return ItemOut(
                productId=i.product_id,
                productName=i.product_name,
                category=i.category,
                priceCents=i.price_cents,
                qty=i.qty,
                ownerUserId=i.owner_user_id,
                isSeller=i.is_seller,
                description=i.description,
                photos=i.photos,
                avgRating=getattr(i, "avg_rating", 0)
            )
    raise HTTPException(status_code=404, detail="Item not found")

@router.get("/owner/{ownerUserId}", response_model=list[ItemOut])
async def list_by_owner(ownerUserId: str, repo: MongoItemRepo = Depends(item_repo)):
    uc = ListItemsByOwner(repo)
    items = await uc.execute(owner_user_id=ownerUserId)
    return [ItemOut(
        productId=i.product_id, productName=i.product_name, category=i.category,
        priceCents=i.price_cents, qty=i.qty, ownerUserId=i.owner_user_id,
        isSeller=i.is_seller, description=i.description, photos=i.photos
    ) for i in items]
