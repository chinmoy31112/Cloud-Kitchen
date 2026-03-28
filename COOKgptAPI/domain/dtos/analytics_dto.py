"""
Domain DTOs: Analytics Data Transfer Objects
"""
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class DashboardDTO:
    total_orders: int = 0
    total_revenue: float = 0.0
    total_customers: int = 0
    total_menu_items: int = 0
    pending_orders: int = 0
    delivered_orders: int = 0
    cancelled_orders: int = 0
    average_order_value: float = 0.0


@dataclass
class SalesReportDTO:
    daily_sales: List[dict] = field(default_factory=list)
    popular_items: List[dict] = field(default_factory=list)
    total_revenue: float = 0.0
    total_orders: int = 0
    period: str = ''


@dataclass
class KitchenTimerDTO:
    order_id: int = 0
    order_item_id: int = 0
    menu_item_name: str = ''
    estimated_time: int = 0
    status: str = 'pending'


@dataclass
class DemandPredictionDTO:
    menu_item_id: int = 0
    menu_item_name: str = ''
    predicted_date: str = ''
    predicted_quantity: int = 0
    confidence: float = 0.0
