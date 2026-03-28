"""
Application Layer: Service Interfaces
Abstract base classes defining the contracts for all business services.
"""
from abc import ABC, abstractmethod
from typing import Optional, List


class IAuthService(ABC):
    @abstractmethod
    def register(self, data: dict) -> dict:
        pass

    @abstractmethod
    def login(self, email: str, password: str) -> Optional[dict]:
        pass


class IUserService(ABC):
    @abstractmethod
    def get_profile(self, user_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def update_profile(self, user_id: int, data: dict) -> Optional[dict]:
        pass

    @abstractmethod
    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        pass

    @abstractmethod
    def get_addresses(self, user_id: int) -> List[dict]:
        pass

    @abstractmethod
    def add_address(self, user_id: int, data: dict) -> dict:
        pass

    @abstractmethod
    def update_address(self, address_id: int, data: dict) -> Optional[dict]:
        pass

    @abstractmethod
    def delete_address(self, address_id: int) -> bool:
        pass


class IMenuService(ABC):
    @abstractmethod
    def create_item(self, data: dict) -> dict:
        pass

    @abstractmethod
    def get_item(self, item_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def list_items(self, category_id=None, is_available=None, search='') -> List[dict]:
        pass

    @abstractmethod
    def update_item(self, item_id: int, data: dict) -> Optional[dict]:
        pass

    @abstractmethod
    def delete_item(self, item_id: int) -> bool:
        pass

    @abstractmethod
    def create_category(self, data: dict) -> dict:
        pass

    @abstractmethod
    def list_categories(self) -> List[dict]:
        pass

    @abstractmethod
    def delete_category(self, category_id: int) -> bool:
        pass


class IOrderService(ABC):
    @abstractmethod
    def place_order(self, user_id: int, data: dict) -> dict:
        pass

    @abstractmethod
    def get_order(self, order_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def get_user_orders(self, user_id: int) -> List[dict]:
        pass

    @abstractmethod
    def get_all_orders(self, status=None) -> List[dict]:
        pass

    @abstractmethod
    def update_order_status(self, order_id: int, status: str,
                             estimated_time: Optional[int] = None) -> Optional[dict]:
        pass


class ICartService(ABC):
    @abstractmethod
    def get_cart(self, user_id: int) -> dict:
        pass

    @abstractmethod
    def add_item(self, user_id: int, menu_item_id: int, quantity: int) -> dict:
        pass

    @abstractmethod
    def remove_item(self, user_id: int, item_id: int) -> bool:
        pass

    @abstractmethod
    def update_item_quantity(self, user_id: int, item_id: int, quantity: int) -> Optional[dict]:
        pass

    @abstractmethod
    def clear_cart(self, user_id: int) -> bool:
        pass


class IPaymentService(ABC):
    @abstractmethod
    def create_payment(self, data: dict) -> dict:
        pass

    @abstractmethod
    def get_payment(self, payment_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def get_payment_by_order(self, order_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def update_payment_status(self, payment_id: int, status: str) -> Optional[dict]:
        pass


class IDeliveryService(ABC):
    @abstractmethod
    def assign_delivery(self, data: dict) -> dict:
        pass

    @abstractmethod
    def get_delivery(self, delivery_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def update_delivery_status(self, delivery_id: int, data: dict) -> Optional[dict]:
        pass

    @abstractmethod
    def get_agent_deliveries(self, agent_id: int, status=None) -> List[dict]:
        pass

    @abstractmethod
    def update_location(self, delivery_id: int, lat: float, lng: float) -> Optional[dict]:
        pass

    @abstractmethod
    def track_delivery(self, order_id: int) -> Optional[dict]:
        pass


class IAIService(ABC):
    @abstractmethod
    def recommend_recipes(self, user_id: int, ingredients: list) -> dict:
        pass

    @abstractmethod
    def get_history(self, user_id: int) -> List[dict]:
        pass

    @abstractmethod
    def get_popular_ingredients(self) -> List[dict]:
        pass


class IAnalyticsService(ABC):
    @abstractmethod
    def get_dashboard(self) -> dict:
        pass

    @abstractmethod
    def get_sales_report(self, start_date, end_date) -> dict:
        pass

    @abstractmethod
    def get_popular_items(self, limit=10) -> List[dict]:
        pass

    @abstractmethod
    def get_active_timers(self) -> List[dict]:
        pass

    @abstractmethod
    def update_timer(self, timer_id: int, status: str) -> Optional[dict]:
        pass

    @abstractmethod
    def get_predictions(self, target_date=None) -> List[dict]:
        pass
