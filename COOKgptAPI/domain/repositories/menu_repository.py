"""
Domain Repository Interface: IMenuRepository
"""
from abc import ABC, abstractmethod
from typing import Optional, List


class IMenuRepository(ABC):

    @abstractmethod
    def create_item(self, **kwargs) -> dict:
        pass

    @abstractmethod
    def get_item_by_id(self, item_id: int) -> Optional[dict]:
        pass

    @abstractmethod
    def list_items(self, category_id: Optional[int] = None,
                   is_available: Optional[bool] = None,
                   search: str = '') -> List[dict]:
        pass

    @abstractmethod
    def update_item(self, item_id: int, **kwargs) -> Optional[dict]:
        pass

    @abstractmethod
    def delete_item(self, item_id: int) -> bool:
        pass

    @abstractmethod
    def update_item_image(self, item_id: int, image_path: str) -> Optional[dict]:
        pass

    # Category methods
    @abstractmethod
    def create_category(self, name: str, description: str = '') -> dict:
        pass

    @abstractmethod
    def list_categories(self) -> List[dict]:
        pass

    @abstractmethod
    def update_category(self, category_id: int, **kwargs) -> Optional[dict]:
        pass

    @abstractmethod
    def delete_category(self, category_id: int) -> bool:
        pass
