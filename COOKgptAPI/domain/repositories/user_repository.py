"""
Domain Repository Interface: IUserRepository
Abstract base class defining the contract for user data access.
"""
from abc import ABC, abstractmethod
from typing import Optional, List


class IUserRepository(ABC):

    @abstractmethod
    def create(self, email: str, username: str, password: str,
               first_name: str, last_name: str, phone: str, role: str) -> dict:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[dict]:
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[dict]:
        pass

    @abstractmethod
    def update(self, user_id: int, **kwargs) -> Optional[dict]:
        pass

    @abstractmethod
    def delete(self, user_id: int) -> bool:
        pass

    @abstractmethod
    def list_by_role(self, role: str) -> List[dict]:
        pass

    @abstractmethod
    def authenticate(self, email: str, password: str) -> Optional[dict]:
        pass

    @abstractmethod
    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        pass

    # Address methods
    @abstractmethod
    def create_address(self, user_id: int, **kwargs) -> dict:
        pass

    @abstractmethod
    def get_addresses(self, user_id: int) -> List[dict]:
        pass

    @abstractmethod
    def update_address(self, address_id: int, **kwargs) -> Optional[dict]:
        pass

    @abstractmethod
    def delete_address(self, address_id: int) -> bool:
        pass
