"""
Domain DTOs: User-related Data Transfer Objects
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class RegisterDTO:
    email: str = ''
    username: str = ''
    password: str = ''
    first_name: str = ''
    last_name: str = ''
    phone: str = ''
    role: str = 'customer'


@dataclass
class LoginDTO:
    email: str = ''
    password: str = ''


@dataclass
class UserProfileDTO:
    id: Optional[int] = None
    email: str = ''
    username: str = ''
    first_name: str = ''
    last_name: str = ''
    phone: str = ''
    role: str = ''
    profile_image: Optional[str] = None


@dataclass
class AddressDTO:
    id: Optional[int] = None
    label: str = ''
    street: str = ''
    city: str = ''
    state: str = ''
    pincode: str = ''
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False


@dataclass
class ChangePasswordDTO:
    old_password: str = ''
    new_password: str = ''
