# app/application/use_cases.py
from typing import Optional, Sequence, Iterable, List
from dataclasses import dataclass
from app.domain.entities import Item, User, Purchase, Review, CartItem
from app.domain.repositories import ItemRepo, UserRepository, PurchaseRepository, ReviewRepository
from app.infrastructure.cart_repo import MongoCartRepo
from app.infrastructure.item_repo import MongoItemRepo
from app.domain.services import StorageService
import bcrypt
from datetime import datetime
import uuid

from app.domain.results import Result



# ========== EXISTING ITEM USE CASES ==========

class CreateItem:
    def __init__(self, repo: ItemRepo, storage: StorageService | None = None):
        self.repo = repo
        self.storage = storage

    async def execute(
        self, *, product_id: str, product_name: str, category: str,
        price_cents: int, qty: int, owner_user_id: str,
        is_seller: bool, description: Optional[str],
        files: Sequence[bytes] | None = None, filenames: Sequence[str] | None = None
    ) -> Item:
        photos: list[str] = []
        if self.storage and files and filenames:
            photos = await self.storage.save_files(files, filenames)

        item = Item(
            product_id=product_id,
            product_name=product_name,
            category=category,
            price_cents=price_cents,
            qty=qty,
            owner_user_id=owner_user_id,
            is_seller=is_seller,
            description=description,
            photos=photos or None,
        )
        return await self.repo.create(item)


class ListItems:
    def __init__(self, repo: ItemRepo):
        self.repo = repo

    async def execute(self, *, is_seller: Optional[bool], category: Optional[str]) -> Iterable[Item]:
        return await self.repo.list(is_seller=is_seller, category=category)


class ListItemsByOwner:
    def __init__(self, repo: ItemRepo):
        self.repo = repo

    async def execute(self, owner_user_id: str) -> Iterable[Item]:
        return await self.repo.list_by_owner(owner_user_id)


# ========== NEW USER USE CASES ==========

@dataclass
class UserResult:
    user: Optional[User] = None
    error: Optional[str] = None


@dataclass
class OperationResult:
    success: bool = False
    error: Optional[str] = None


class CreateUser:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    @staticmethod
    def _hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    async def execute(
        self,
        name: str,
        email: str,
        username: str,
        password: str
    ) -> UserResult:
        # Check if username exists
        existing = await self.repo.get_by_username(username)
        if existing:
            return UserResult(error="Username already exists")
        
        # Check if email exists
        existing_email = await self.repo.get_by_email(email)
        if existing_email:
            return UserResult(error="Email already exists")
        
        # Hash password
        hashed_password = self._hash_password(password)
        
        # Create user
        user = await self.repo.create(
            name=name,
            email=email,
            username=username,
            password=hashed_password
        )
        
        return UserResult(user=user)


class AuthenticateUser:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    @staticmethod
    def _verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    async def execute(self, username: str, password: str) -> UserResult:
        user = await self.repo.get_by_username(username)
        
        if not user:
            return UserResult(error="Invalid username or password")
        
        if not self._verify_password(password, user.password):
            return UserResult(error="Invalid username or password")
        
        return UserResult(user=user)


class GetUserById:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    async def execute(self, user_id: str) -> Optional[User]:
        return await self.repo.get_by_id(user_id)


class ListUsers:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    async def execute(self) -> List[User]:
        return await self.repo.list_all()


class UpdateUserPassword:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    @staticmethod
    def _hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def _verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    
    async def execute(
        self,
        user_id: str,
        old_password: str,
        new_password: str
    ) -> OperationResult:
        user = await self.repo.get_by_id(user_id)
        
        if not user:
            return OperationResult(error="User not found")
        
        # Verify old password
        if not self._verify_password(old_password, user.password):
            return OperationResult(error="Incorrect old password")
        
        # Hash new password
        hashed_password = self._hash_password(new_password)
        
        # Update password
        success = await self.repo.update_password(user_id, hashed_password)
        
        if not success:
            return OperationResult(error="Failed to update password")
        
        return OperationResult(success=True)


class DeleteUser:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    async def execute(self, user_id: str) -> OperationResult:
        user = await self.repo.get_by_id(user_id)
        
        if not user:
            return OperationResult(error="User not found")
        
        success = await self.repo.delete(user_id)
        
        if not success:
            return OperationResult(error="Failed to delete user")
        
        return OperationResult(success=True)


class ForgotPasswordSuccess:
    pass


class ForgotPassword: 
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def execute(self, email: str) -> Result[ForgotPasswordSuccess, str]:
        # --- 1. Find the user ---
        user = await self.user_repo.get_by_email(email)

        if not user:
            return Result.ok(ForgotPasswordSuccess()) 

        # --- 2. Generate token and send email (Placeholder Logic) ---    
        print(f"DEBUG: Generating token for {email} and sending email...")
        
        # token = generate_unique_token(user.user_id) 
        # await self.user_repo.save_reset_token(user.user_id, token)
        # await send_reset_email(user.email, token)
        
        # Assume success for now
        return Result.ok(ForgotPasswordSuccess())


    
# ====== PURCHASE USE CASES ========

@dataclass
class PurchaseResult:
    purchase: Optional[Purchase] = None
    error: Optional[str] = None


class PurchaseItem:
    """Use case for purchasing an item"""
    
    def __init__(self, purchase_repo: PurchaseRepository, item_repo: ItemRepo):
        self.purchase_repo = purchase_repo
        self.item_repo = item_repo
    
    async def execute(
        self,
        buyer_user_id: str,
        product_id: str,
        quantity: int
    ) -> PurchaseResult:
        # 1. Get the item
        item = await self.item_repo.get_by_id(product_id)
        if not item:
            return PurchaseResult(error="Product not found")
        
        # 2. Check if item is for sale
        if not item.is_seller:
            return PurchaseResult(error="This item is not for sale")
        
        # 3. Check if buyer is not the owner
        if item.owner_user_id == buyer_user_id:
            return PurchaseResult(error="You cannot buy your own item")
        
        # 4. Check quantity availability
        if item.qty < quantity:
            return PurchaseResult(error=f"Only {item.qty} items available")
        
        # 5. Calculate total price
        total_price = item.price_cents * quantity
        
        # 6. Create purchase record with photo stored
        purchase = Purchase(
            purchase_id=str(uuid.uuid4()),
            buyer_user_id=buyer_user_id,
            seller_user_id=item.owner_user_id,
            product_id=product_id,
            product_name=item.product_name,
            quantity=quantity,
            total_price_cents=total_price,
            purchase_date=datetime.utcnow(),
            status="completed",
            photo=item.photos[0] if item.photos else None  # 🔥 IMAGE SUPPORT
        )
        
        # 7. Update item quantity
        new_qty = item.qty - quantity
        await self.item_repo.update_quantity(product_id, new_qty)
        
        # 8. Save purchase
        created_purchase = await self.purchase_repo.create(purchase)
        
        return PurchaseResult(purchase=created_purchase)



class GetPurchasesByBuyer:
    """Get all purchases by a buyer"""
    
    def __init__(self, purchase_repo: PurchaseRepository):
        self.purchase_repo = purchase_repo
    
    async def execute(self, buyer_user_id: str) -> List[Purchase]:
        return await self.purchase_repo.list_by_buyer(buyer_user_id)


class GetPurchasesBySeller:
    """Get all purchases (sales) for a seller"""
    
    def __init__(self, purchase_repo: PurchaseRepository):
        self.purchase_repo = purchase_repo
    
    async def execute(self, seller_user_id: str) -> List[Purchase]:
        return await self.purchase_repo.list_by_seller(seller_user_id)


class GetPurchaseById:
    """Get a specific purchase by ID"""
    
    def __init__(self, purchase_repo: PurchaseRepository):
        self.purchase_repo = purchase_repo
    
    async def execute(self, purchase_id: str) -> Optional[Purchase]:
        return await self.purchase_repo.get_by_id(purchase_id)
    
 # ====== REVIEWS USE CASES =======   
    
class ReviewService:
    def __init__(self, review_repo: ReviewRepository, purchase_repo: PurchaseRepository):
        self.review_repo = review_repo
        self.purchase_repo = purchase_repo
    
    async def create_review(
        self,
        purchase_id: str,
        reviewer_user_id: str,
        rating: int,
        comment: str
    ) -> dict:
        """Create a new review for a purchase"""
        
        # Validate rating
        if rating < 1 or rating > 5:
            return {
                "success": False,
                "error": "Rating must be between 1 and 5 stars"
            }
        
        # Validate comment
        if not comment or len(comment.strip()) == 0:
            return {
                "success": False,
                "error": "Comment cannot be empty"
            }
        
        # Get purchase details
        purchase = await self.purchase_repo.get_by_id(purchase_id)
        if not purchase:
            return {
                "success": False,
                "error": "Purchase not found"
            }
        
        # Verify the reviewer is the buyer
        # if purchase.buyer_user_id != reviewer_user_id:
        #     return {
        #         "success": False,
        #         "error": "Only the buyer can review this purchase"
        #     }
        
        # Check if purchase is completed
        if purchase.status != "completed":
            return {
                "success": False,
                "error": "Can only review completed purchases"
            }
        
        # Check if review already exists for this purchase
        existing_review = await self.review_repo.get_by_purchase_id(purchase_id)
        if existing_review:
            return {
                "success": False,
                "error": "Review already exists for this purchase"
            }
        
        # Create review
        review = Review(
            review_id=str(uuid.uuid4()),
            purchase_id=purchase_id,
            reviewer_user_id=purchase.buyer_user_id,
            reviewed_user_id=purchase.seller_user_id,
            product_id=purchase.product_id,
            rating=rating,
            comment=comment.strip(),
            created_at=datetime.utcnow()
        )
        
        created_review = await self.review_repo.create(review)
        
        return {
            "success": True,
            "review": created_review
        }
    
    async def update_review(
        self,
        review_id: str,
        user_id: str,
        rating: int,
        comment: str
    ) -> dict:
        """Update an existing review"""
        
        # Validate rating
        if rating < 1 or rating > 5:
            return {
                "success": False,
                "error": "Rating must be between 1 and 5 stars"
            }
        
        # Validate comment
        if not comment or len(comment.strip()) == 0:
            return {
                "success": False,
                "error": "Comment cannot be empty"
            }
        
        # Get existing review
        review = await self.review_repo.get_by_id(review_id)
        if not review:
            return {
                "success": False,
                "error": "Review not found"
            }
        
        # Verify the user is the reviewer
        if review.reviewer_user_id != user_id:
            return {
                "success": False,
                "error": "Only the reviewer can update this review"
            }
        
        # Update review
        success = await self.review_repo.update(review_id, rating, comment.strip())
        
        if not success:
            return {
                "success": False,
                "error": "Failed to update review"
            }
        
        # Get updated review
        updated_review = await self.review_repo.get_by_id(review_id)
        
        return {
            "success": True,
            "review": updated_review
        }
    
    async def delete_review(self, review_id: str, user_id: str) -> dict:
        """Delete a review"""
        review = await self.review_repo.get_by_id(review_id)
        if not review:
            return {
                "success": False,
                "error": "Review not found"
            }
        
        # Verify the user is the reviewer
        if review.reviewer_user_id != user_id:
            return {
                "success": False,
                "error": "Only the reviewer can delete this review"
            }
        
        deleted = await self.review_repo.delete(review_id)
        
        return {
            "success": deleted,
            "message": "Review deleted successfully" if deleted else "Failed to delete review"
        }
    
    async def get_seller_reviews(self, seller_user_id: str) -> dict:
        """Get all reviews for a seller with statistics"""
        reviews = await self.review_repo.list_by_seller(seller_user_id)
        stats = await self.review_repo.get_seller_rating_stats(seller_user_id)
        
        return {
            "reviews": reviews,
            "average_rating": stats["average_rating"],
            "total_reviews": stats["total_reviews"],
            "rating_distribution": stats["rating_distribution"]
        }
    
    async def get_product_reviews(self, product_id: str) -> dict:
        """Get all reviews for a product"""
        reviews = await self.review_repo.list_by_product(product_id)
        
        # Calculate average rating for this product
        if reviews:
            avg_rating = sum(r.rating for r in reviews) / len(reviews)
            avg_rating = round(avg_rating, 2)
        else:
            avg_rating = None
        
        return {
            "reviews": reviews,
            "average_rating": avg_rating,
            "total_reviews": len(reviews)
        }
    
    async def get_user_reviews(self, user_id: str) -> dict:
        """Get all reviews written by a user"""
        reviews = await self.review_repo.list_by_reviewer(user_id)
        
        return {
            "reviews": reviews,
            "total_reviews": len(reviews)
        }


# ===== ADMIN USE CASES =====
# all admin related functions

class UpdateStatus:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    async def execute(self, user_id:str, new_status:str) -> bool:
         return await self.repo.update_status(user_id,new_status)
