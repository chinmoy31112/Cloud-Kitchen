"""
Domain Repository Interface: ICartRepository
"""
from abc import ABC, abstractmethod
from typing import Optional, List


class ICartRepository(ABC):

    @abstractmethod
    def get_or_create(self, user_id: int) -> dict:
        pass

    @abstractmethod
    def add_item(self, cart_id: int, menu_item_id: int, quantity: int = 1) -> dict:
        pass

    @abstractmethod
    def remove_item(self, cart_id: int, item_id: int) -> bool:
        pass

    @abstractmethod
    def update_item_quantity(self, cart_id: int, item_id: int, quantity: int) -> Optional[dict]:
        pass

    @abstractmethod
    def get_cart_items(self, cart_id: int) -> List[dict]:
        pass

    @abstractmethod
    def clear_cart(self, cart_id: int) -> bool:
        pass

    @abstractmethod
    def get_cart_total(self, cart_id: int) -> dict:
        pass
