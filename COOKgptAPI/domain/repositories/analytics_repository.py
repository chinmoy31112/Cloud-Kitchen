"""
Domain Repository Interface: IAnalyticsRepository
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from datetime import date


class IAnalyticsRepository(ABC):

    @abstractmethod
    def get_dashboard_stats(self) -> dict:
        pass

    @abstractmethod
    def get_daily_sales(self, start_date: date, end_date: date) -> List[dict]:
        pass

    @abstractmethod
    def get_popular_items(self, limit: int = 10) -> List[dict]:
        pass

    @abstractmethod
    def get_revenue_by_period(self, period: str = 'daily') -> List[dict]:
        pass

    @abstractmethod
    def get_customer_stats(self) -> dict:
        pass

    # Kitchen Timer methods
    @abstractmethod
    def create_timer(self, order_id: int, order_item_id: int,
                     menu_item_name: str, estimated_time: int) -> dict:
        pass

    @abstractmethod
    def update_timer_status(self, timer_id: int, status: str) -> Optional[dict]:
        pass

    @abstractmethod
    def get_active_timers(self) -> List[dict]:
        pass

    # Demand Prediction methods
    @abstractmethod
    def save_prediction(self, menu_item_id: int, predicted_date: date,
                        predicted_quantity: int, confidence: float) -> dict:
        pass

    @abstractmethod
    def get_predictions(self, target_date: Optional[date] = None) -> List[dict]:
        pass
