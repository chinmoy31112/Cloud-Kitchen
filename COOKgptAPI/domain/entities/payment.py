"""
Domain Entity: Payment
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from enum import Enum


class PaymentMethod(str, Enum):
    CASH_ON_DELIVERY = 'cash_on_delivery'
    UPI = 'upi'
    ONLINE = 'online'


class PaymentStatus(str, Enum):
    PENDING = 'pending'
    SUCCESS = 'success'
    FAILED = 'failed'
    REFUNDED = 'refunded'


@dataclass
class PaymentEntity:
    id: Optional[int] = None
    order_id: Optional[int] = None
    amount: float = 0.0
    method: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY
    status: PaymentStatus = PaymentStatus.PENDING
    transaction_id: str = ''
    payment_gateway_response: str = ''
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
