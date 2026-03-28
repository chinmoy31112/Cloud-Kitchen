"""
Domain DTOs: Delivery-related Data Transfer Objects
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class AssignDeliveryDTO:
    order_id: int = 0
    agent_id: int = 0
    estimated_time: Optional[int] = None


@dataclass
class UpdateDeliveryStatusDTO:
    status: str = ''
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    delivery_notes: str = ''


@dataclass
class DeliveryResponseDTO:
    id: int = 0
    order_id: int = 0
    agent_id: int = 0
    agent_name: str = ''
    status: str = ''
    pickup_time: Optional[str] = None
    delivery_time: Optional[str] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    estimated_time: Optional[int] = None
    distance: Optional[float] = None
    created_at: str = ''


@dataclass
class DeliveryTrackingDTO:
    order_id: int = 0
    status: str = ''
    agent_name: str = ''
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    estimated_time: Optional[int] = None
