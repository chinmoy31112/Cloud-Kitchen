"""
Domain Entity: Cart & CartItem
"""
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime


@dataclass
class CartItemEntity:
    id: Optional[int] = None
    cart_id: Optional[int] = None
    menu_item_id: Optional[int] = None
    menu_item_name: str = ''
    menu_item_price: float = 0.0
    quantity: int = 1
    total_price: float = 0.0


@dataclass
class CartEntity:
    id: Optional[int] = None
    user_id: Optional[int] = None
    items: List[CartItemEntity] = field(default_factory=list)
    subtotal: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
