"""
Domain Entity: Analytics
"""
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime, date


@dataclass
class DashboardStatsEntity:
    total_orders: int = 0
    total_revenue: float = 0.0
    total_customers: int = 0
    total_menu_items: int = 0
    pending_orders: int = 0
    delivered_orders: int = 0
    cancelled_orders: int = 0
    average_order_value: float = 0.0


@dataclass
class DailySalesEntity:
    date: Optional[date] = None
    total_orders: int = 0
    total_revenue: float = 0.0


@dataclass
class PopularItemEntity:
    menu_item_id: int = 0
    menu_item_name: str = ''
    total_ordered: int = 0
    total_revenue: float = 0.0


@dataclass
class KitchenTimerEntity:
    id: Optional[int] = None
    order_id: Optional[int] = None
    order_item_id: Optional[int] = None
    menu_item_name: str = ''
    estimated_time: int = 0
    actual_time: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: str = 'pending'  # pending, in_progress, completed


@dataclass
class DemandPredictionEntity:
    id: Optional[int] = None
    menu_item_id: Optional[int] = None
    menu_item_name: str = ''
    predicted_date: Optional[date] = None
    predicted_quantity: int = 0
    actual_quantity: Optional[int] = None
    confidence: float = 0.0
    created_at: Optional[datetime] = None
