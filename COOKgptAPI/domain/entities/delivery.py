"""
Domain Entity: Delivery
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from enum import Enum


class DeliveryStatus(str, Enum):
    ASSIGNED = 'assigned'
    PICKED = 'picked'
    IN_TRANSIT = 'in_transit'
    DELIVERED = 'delivered'
    FAILED = 'failed'


@dataclass
class DeliveryEntity:
    id: Optional[int] = None
    order_id: Optional[int] = None
    agent_id: Optional[int] = None
    agent_name: str = ''
    status: DeliveryStatus = DeliveryStatus.ASSIGNED
    pickup_time: Optional[datetime] = None
    delivery_time: Optional[datetime] = None
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    estimated_time: Optional[int] = None  # minutes
    distance: Optional[float] = None  # km
    delivery_notes: str = ''
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
