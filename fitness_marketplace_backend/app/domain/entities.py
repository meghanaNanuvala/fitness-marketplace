from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

@dataclass(frozen=True)
class User:
    user_id: str
    name: str
    email: str
    username: str
    password: str
    status : str
    role: str

@dataclass
class Item:
    product_id: str
    product_name: str
    category: str
    price_cents: int
    qty: int
    is_seller: bool
    owner_user_id: str
    photos: List[str] | None = None
    description: Optional[str] = None
    avg_rating: float = 0  
    
    # status
    
    # createdat
    
    

@dataclass(frozen=True)
class Purchase:
    purchase_id: str
    buyer_user_id: str
    seller_user_id: str
    product_id: str
    product_name: str
    quantity: int
    total_price_cents: int
    purchase_date: datetime
    status: str  # "pending", "completed", "cancelled"
    photo: Optional[str] = None 

@dataclass(frozen=True)
class Review:
    review_id: str
    purchase_id: str
    reviewer_user_id: str  # User who wrote the review
    reviewed_user_id: str  # User being reviewed (seller)
    product_id: str
    rating: int  # 1-5 stars
    comment: str
    created_at: datetime
    updated_at: Optional[datetime] = None

@dataclass
class CartItem:
    user_id: str
    product_id: str
    product_name: str
    price_cents: int
    quantity: int
    seller_user_id: str
    photo: Optional[str] = None