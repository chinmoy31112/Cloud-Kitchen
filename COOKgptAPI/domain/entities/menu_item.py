"""
Domain Entity: MenuItem & Category
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from enum import Enum


class FoodCategory(str, Enum):
    PIZZA = 'pizza'
    BURGER = 'burger'
    INDIAN = 'indian'
    CHINESE = 'chinese'
    BEVERAGES = 'beverages'
    DESSERT = 'dessert'
    SALAD = 'salad'
    OTHER = 'other'


@dataclass
class CategoryEntity:
    id: Optional[int] = None
    name: str = ''
    description: str = ''
    image: Optional[str] = None
    is_active: bool = True


@dataclass
class MenuItemEntity:
    id: Optional[int] = None
    name: str = ''
    description: str = ''
    price: float = 0.0
    category_id: Optional[int] = None
    category_name: str = ''
    image: Optional[str] = None
    is_available: bool = True
    is_vegetarian: bool = False
    preparation_time: int = 15  # minutes
    calories: Optional[int] = None
    rating: float = 0.0
    total_ratings: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
