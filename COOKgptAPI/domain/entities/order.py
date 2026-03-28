"""
Domain Entity: Order & OrderItem
"""
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    PREPARING = 'preparing'
    READY = 'ready'
    OUT_FOR_DELIVERY = 'out_for_delivery'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'


@dataclass
class OrderItemEntity:
    id: Optional[int] = None
    order_id: Optional[int] = None
    menu_item_id: Optional[int] = None
    menu_item_name: str = ''
    quantity: int = 1
    unit_price: float = 0.0
    total_price: float = 0.0
    special_instructions: str = ''


@dataclass
class OrderEntity:
    id: Optional[int] = None
    order_number: str = ''
    user_id: Optional[int] = None
    user_name: str = ''
    delivery_address_id: Optional[int] = None
    delivery_address: str = ''
    status: OrderStatus = OrderStatus.PENDING
    subtotal: float = 0.0
    discount: float = 0.0
    delivery_charge: float = 0.0
    tax: float = 0.0
    total: float = 0.0
    special_instructions: str = ''
    estimated_delivery_time: Optional[int] = None  # minutes
    items: List[OrderItemEntity] = field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
