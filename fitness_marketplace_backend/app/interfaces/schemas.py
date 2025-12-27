# interfaces/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class ItemCreate(BaseModel):
    productId: str
    productName: str
    category: str
    priceCents: int
    qty: int = 1
    ownerUserId: str
    isSeller: bool = True
    photos: Optional[List[str]] = None
    description: Optional[str] = None

class ItemOut(BaseModel):
    productId: str
    productName: str
    category: str
    priceCents: int
    qty: int
    ownerUserId: str
    isSeller: bool
    photos: Optional[List[str]] = None
    description: Optional[str] = None
    avgRating: float | None = 0

# User Input Schemas
class UserCreateIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)


class UserLoginIn(BaseModel):
    username: str
    password: str


class PasswordUpdateIn(BaseModel):
    oldPassword: str
    newPassword: str = Field(..., min_length=8)


# User Output Schemas
class UserOut(BaseModel):
    userId: str
    name: str
    email: str
    username: str
    status: str
    role: str


class UserAuthOut(BaseModel):
    userId: str
    name: str
    email: str
    username: str
    message: str
    status: str
    role: str

class PurchaseIn(BaseModel):
    productId: str = Field(..., alias="productId")
    quantity: int = Field(1, ge=1)
    
    class Config:
        populate_by_name = True

class PurchaseOut(BaseModel):
    purchaseId: str
    buyerUserId: str
    sellerUserId: str
    productId: str
    productName: str
    quantity: int
    totalPriceCents: int
    purchaseDate: datetime
    status: str

from pydantic import BaseModel, EmailStr

class CartItemIn(BaseModel):
    productId: str
    quantity: int = 1

class CartItemOut(BaseModel):
    userId: str
    productId: str
    productName: str
    priceCents: int
    quantity: int
    sellerUserId: str
    photo: str | None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class StatusUpdateRequest(BaseModel):
    user_id:str
    new_status:str