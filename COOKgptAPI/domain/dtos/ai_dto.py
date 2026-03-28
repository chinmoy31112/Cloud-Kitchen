"""
Domain DTOs: AI Recommendation Data Transfer Objects
"""
from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class AIQueryDTO:
    ingredients: List[str] = field(default_factory=list)


@dataclass
class RecipeRecommendationDTO:
    name: str = ''
    description: str = ''
    ingredients: List[str] = field(default_factory=list)
    instructions: List[str] = field(default_factory=list)
    preparation_time: int = 0
    cooking_time: int = 0
    servings: int = 1
    difficulty: str = 'easy'
    cuisine: str = ''
    match_score: float = 0.0


@dataclass
class AIHistoryResponseDTO:
    id: int = 0
    input_ingredients: List[str] = field(default_factory=list)
    recommended_recipes: List[dict] = field(default_factory=list)
    created_at: str = ''
