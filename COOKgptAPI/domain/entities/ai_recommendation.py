"""
Domain Entity: AI Recommendation
"""
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime


@dataclass
class RecipeEntity:
    name: str = ''
    description: str = ''
    ingredients: List[str] = field(default_factory=list)
    instructions: List[str] = field(default_factory=list)
    preparation_time: int = 0  # minutes
    cooking_time: int = 0  # minutes
    servings: int = 1
    difficulty: str = 'easy'  # easy, medium, hard
    cuisine: str = ''
    image_url: str = ''
    match_score: float = 0.0  # how well it matches the input


@dataclass
class AIRecommendationEntity:
    id: Optional[int] = None
    user_id: Optional[int] = None
    input_ingredients: List[str] = field(default_factory=list)
    recommended_recipes: List[dict] = field(default_factory=list)
    created_at: Optional[datetime] = None
