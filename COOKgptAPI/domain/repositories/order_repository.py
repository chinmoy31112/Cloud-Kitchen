"""
Domain Repository Interface: IOrderRepository
"""
from abc import ABC, abstractmethod
from typing import Optional, List


class IOrderRepository(ABC):

    @abstractmethod
    def create(self, user_id: int, delivery_address_id: int, items: list,
               special_instructions: str = '', **kwargs) -> dict:
        pass

    @abstractmethod
    def get_by_id(self, order_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def list_by_user(self, user_id: int) -> List[dict]:
        pass

    @abstractmethod
    def list_all(self, status: Optional[str] = None) -> List[dict]:
        pass

    @abstractmethod
    def update_status(self, order_id: int, status: str,
                      estimated_delivery_time: Optional[int] = None) -> Optional[dict]:
        pass

    @abstractmethod
    def get_order_items(self, order_id: int) -> List[dict]:
        pass
