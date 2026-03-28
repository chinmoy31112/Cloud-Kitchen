"""
Domain DTOs: Cart-related Data Transfer Objects
"""
from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class AddToCartDTO:
    menu_item_id: int = 0
    quantity: int = 1


@dataclass
class UpdateCartItemDTO:
    quantity: int = 1


@dataclass
class CartItemResponseDTO:
    id: int = 0
    menu_item_id: int = 0
    menu_item_name: str = ''
    menu_item_price: float = 0.0
    quantity: int = 1
    total_price: float = 0.0


@dataclass
class CartResponseDTO:
    id: int = 0
    items: List[CartItemResponseDTO] = field(default_factory=list)
    subtotal: float = 0.0
    discount: float = 0.0
    total: float = 0.0
    item_count: int = 0
