from app.infrastructure.cart_repo import MongoCartRepo
from app.infrastructure.item_repo import MongoItemRepo
from app.domain.entities import CartItem

class AddToCart:
    def __init__(self, repo: MongoCartRepo, items: MongoItemRepo):
        self.repo = repo
        self.items = items

    async def execute(self, user_id: str, product_id: str, quantity: int):
        product = await self.items.get_by_id(product_id)
        if not product:
            return None, "Item not found"

        cart_item = CartItem(
            user_id=user_id,
            product_id=product.product_id,
            product_name=product.product_name,
            price_cents=product.price_cents,
            quantity=quantity,
            seller_user_id=product.owner_user_id,
            photo=(product.photos[0] if product.photos else None)
        )

        await self.repo.add_item(cart_item)
        return cart_item, None


class GetCart:
    def __init__(self, repo: MongoCartRepo):
        self.repo = repo

    async def execute(self, user_id: str):
        return await self.repo.get_cart(user_id)


class RemoveFromCart:
    def __init__(self, repo: MongoCartRepo):
        self.repo = repo

    async def execute(self, user_id: str, product_id: str):
        await self.repo.remove_item(user_id, product_id)


class ClearCart:
    def __init__(self, repo: MongoCartRepo):
        self.repo = repo

    async def execute(self, user_id: str):
        await self.repo.clear_cart(user_id)
