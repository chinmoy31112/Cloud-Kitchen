"""
Domain DTOs: Menu-related Data Transfer Objects
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class CreateMenuItemDTO:
    name: str = ''
    description: str = ''
    price: float = 0.0
    category_id: Optional[int] = None
    is_available: bool = True
    is_vegetarian: bool = False
    preparation_time: int = 15
    calories: Optional[int] = None


@dataclass
class UpdateMenuItemDTO:
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    is_available: Optional[bool] = None
    is_vegetarian: Optional[bool] = None
    preparation_time: Optional[int] = None
    calories: Optional[int] = None


@dataclass
class MenuItemResponseDTO:
    id: int = 0
    name: str = ''
    description: str = ''
    price: float = 0.0
    category_id: Optional[int] = None
    category_name: str = ''
    image: Optional[str] = None
    is_available: bool = True
    is_vegetarian: bool = False
    preparation_time: int = 15
    calories: Optional[int] = None
    rating: float = 0.0
    total_ratings: int = 0


@dataclass
class CreateCategoryDTO:
    name: str = ''
    description: str = ''


@dataclass
class CategoryResponseDTO:
    id: int = 0
    name: str = ''
    description: str = ''
    image: Optional[str] = None
    is_active: bool = True
