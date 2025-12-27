# app/domain/services.py
from __future__ import annotations
from typing import Protocol, Sequence, runtime_checkable


@runtime_checkable
class StorageService(Protocol):
    """
    Abstract service for storing files (e.g., product images).
    Implementations live in the infrastructure layer
    (e.g., LocalStorageService, S3StorageService).
    """

    async def save_files(self, files: Sequence[bytes], names: Sequence[str]) -> list[str]:
        """
        Save files and return accessible URLs.

        Args:
            files: Raw file bytes for each file.
            names: Original file names (order must match files).

        Returns:
            List of URLs or paths pointing to saved files.
        """
        ...


@runtime_checkable
class ItemRepository(Protocol):
    """
    Abstraction for persisting items in the marketplace.
    The implementation could be MongoDB, PostgreSQL, etc.
    """

    async def create_item(self, data: dict) -> dict:
        """
        Insert a new item document/row.
        Args:
            data: dictionary containing item fields.

        Returns:
            Inserted item (with ID).
        """
        ...

    async def get_all_items(self) -> list[dict]:
        """
        Fetch all items in the marketplace.
        Returns:
            List of item dicts.
        """
        ...

    async def get_items_by_user(self, user_id: str) -> list[dict]:
        """
        Fetch items belonging to a particular seller.
        Args:
            user_id: ID of the seller.
        Returns:
            List of item dicts.
        """
        ...
