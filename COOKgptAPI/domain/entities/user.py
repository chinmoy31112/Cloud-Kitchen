"""
Domain Entity: User
Pure Python class - no Django dependencies.
"""
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = 'customer'
    KITCHEN_ADMIN = 'kitchen_admin'
    DELIVERY_AGENT = 'delivery_agent'


@dataclass
class UserEntity:
    id: Optional[int] = None
    email: str = ''
    username: str = ''
    first_name: str = ''
    last_name: str = ''
    phone: str = ''
    role: UserRole = UserRole.CUSTOMER
    is_active: bool = True
    date_joined: Optional[datetime] = None
    profile_image: Optional[str] = None

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()


@dataclass
class AddressEntity:
    id: Optional[int] = None
    user_id: Optional[int] = None
    label: str = ''           # Home, Work, Other
    street: str = ''
    city: str = ''
    state: str = ''
    pincode: str = ''
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False
