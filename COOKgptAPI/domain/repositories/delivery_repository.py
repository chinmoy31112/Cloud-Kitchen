"""
Domain Repository Interface: IDeliveryRepository
"""
from abc import ABC, abstractmethod
from typing import Optional, List


class IDeliveryRepository(ABC):

    @abstractmethod
    def create(self, order_id: int, agent_id: int,
               estimated_time: Optional[int] = None) -> dict:
        pass

    @abstractmethod
    def get_by_id(self, delivery_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def get_by_order(self, order_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def update_status(self, delivery_id: int, status: str, **kwargs) -> Optional[dict]:
        pass

    @abstractmethod
    def list_by_agent(self, agent_id: int, status: Optional[str] = None) -> List[dict]:
        pass

    @abstractmethod
    def update_location(self, delivery_id: int, latitude: float,
                        longitude: float) -> Optional[dict]:
        pass
