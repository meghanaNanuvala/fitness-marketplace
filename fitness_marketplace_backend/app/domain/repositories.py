# domain/repositories.py (interfaces)
from abc import ABC, abstractmethod
from typing import Iterable, Optional, List
from .entities import User, Item, Purchase, Review

class UserRepo(ABC): # Not used anywhere!
    @abstractmethod
    async def create(self, user: User) -> User: ...
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]: ...

class ItemRepo(ABC):
    @abstractmethod
    async def create(self, item: Item) -> Item: ...

    @abstractmethod
    async def list(
        self, *, is_seller: Optional[bool] = None, category: Optional[str] = None
    ) -> Iterable[Item]: ...

    @abstractmethod
    async def list_by_owner(self, owner_user_id: str) -> Iterable[Item]: ...

    @abstractmethod
    async def update_quantity(self, product_id: str, new_qty: int) -> bool:
        pass

    @abstractmethod
    async def get_by_id(self, product_id: str) -> Optional[Item]:
        pass

class UserRepository(ABC):
    @abstractmethod
    async def create(
        self,
        name: str,
        email: str,
        username: str,
        password: str
    ) -> User:
        pass
    
    @abstractmethod
    async def get_by_id(self, user_id: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def list_all(self) -> List[User]:
        pass
    
    @abstractmethod
    async def update_password(self, user_id: str, hashed_password: str) -> bool:
        pass
    
    @abstractmethod
    async def delete(self, user_id: str) -> bool:
        pass

    @abstractmethod
    async def update_status(self, user_id:str,new_status: str) -> bool:
        pass

class PurchaseRepository(ABC):
    @abstractmethod
    async def create(self, purchase: Purchase) -> Purchase:
        pass
    
    @abstractmethod
    async def get_by_id(self, purchase_id: str) -> Optional[Purchase]:
        pass
    
    @abstractmethod
    async def list_by_buyer(self, buyer_user_id: str) -> List[Purchase]:
        pass
    
    @abstractmethod
    async def list_by_seller(self, seller_user_id: str) -> List[Purchase]:
        pass
    
    @abstractmethod
    async def update_status(self, purchase_id: str, status: str) -> bool:
        pass


class ReviewRepository(ABC):
    
    @abstractmethod
    async def create(self, review: Review) -> Review:
        """Create a new review"""
        pass
    
    @abstractmethod
    async def get_by_id(self, review_id: str) -> Optional[Review]:
        """Get a review by ID"""
        pass
    
    @abstractmethod
    async def get_by_purchase_id(self, purchase_id: str) -> Optional[Review]:
        """Get review for a specific purchase"""
        pass
    
    @abstractmethod
    async def list_by_seller(self, seller_user_id: str) -> List[Review]:
        """Get all reviews for a seller"""
        pass
    
    @abstractmethod
    async def list_by_product(self, product_id: str) -> List[Review]:
        """Get all reviews for a product"""
        pass
    
    @abstractmethod
    async def list_by_reviewer(self, reviewer_user_id: str) -> List[Review]:
        """Get all reviews written by a user"""
        pass
    
    @abstractmethod
    async def update(self, review_id: str, rating: int, comment: str) -> bool:
        """Update an existing review"""
        pass
    
    @abstractmethod
    async def delete(self, review_id: str) -> bool:
        """Delete a review"""
        pass
    
    @abstractmethod
    async def get_seller_average_rating(self, seller_user_id: str) -> Optional[float]:
        """Get average rating for a seller"""
        pass
    
    @abstractmethod
    async def get_seller_rating_stats(self, seller_user_id: str) -> dict:
        """Get detailed rating statistics for a seller"""
        pass

