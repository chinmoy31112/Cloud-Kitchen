"""
Domain Repository Interface: IPaymentRepository
"""
from abc import ABC, abstractmethod
from typing import Optional, List


class IPaymentRepository(ABC):

    @abstractmethod
    def create(self, order_id: int, amount: float, method: str,
               transaction_id: str = '') -> dict:
        pass

    @abstractmethod
    def get_by_id(self, payment_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def get_by_order(self, order_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def update_status(self, payment_id: int, status: str,
                      gateway_response: str = '') -> Optional[dict]:
        pass

    @abstractmethod
    def list_by_user(self, user_id: int) -> List[dict]:
        pass
