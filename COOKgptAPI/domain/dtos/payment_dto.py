"""
Domain DTOs: Payment-related Data Transfer Objects
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class CreatePaymentDTO:
    order_id: int = 0
    method: str = 'cash_on_delivery'
    transaction_id: str = ''


@dataclass
class PaymentResponseDTO:
    id: int = 0
    order_id: int = 0
    amount: float = 0.0
    method: str = ''
    status: str = ''
    transaction_id: str = ''
    created_at: str = ''
