"""
Domain DTOs: Order-related Data Transfer Objects
"""
from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class OrderItemDTO:
    menu_item_id: int = 0
    quantity: int = 1
    special_instructions: str = ''


@dataclass
class CreateOrderDTO:
    delivery_address_id: Optional[int] = None
    items: List[OrderItemDTO] = field(default_factory=list)
    special_instructions: str = ''
    payment_method: str = 'cash_on_delivery'


@dataclass
class OrderStatusUpdateDTO:
    status: str = ''
    estimated_delivery_time: Optional[int] = None


@dataclass
class OrderResponseDTO:
    id: int = 0
    order_number: str = ''
    user_name: str = ''
    delivery_address: str = ''
    status: str = ''
    subtotal: float = 0.0
    discount: float = 0.0
    delivery_charge: float = 0.0
    tax: float = 0.0
    total: float = 0.0
    items: list = field(default_factory=list)
    created_at: str = ''
    estimated_delivery_time: Optional[int] = None
