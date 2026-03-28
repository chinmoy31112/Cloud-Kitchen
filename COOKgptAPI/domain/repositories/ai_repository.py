"""
Domain Repository Interface: IAIRepository
"""
from abc import ABC, abstractmethod
from typing import Optional, List


class IAIRepository(ABC):

    @abstractmethod
    def save_query(self, user_id: int, ingredients: list, recipes: list) -> dict:
        pass

    @abstractmethod
    def get_history(self, user_id: int, limit: int = 10) -> List[dict]:
        pass

    @abstractmethod
    def get_popular_ingredients(self, limit: int = 20) -> List[dict]:
        pass

    @abstractmethod
    def get_query_by_id(self, query_id: int) -> Optional[dict]:
        pass
