from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class Ingredients(BaseModel):
    name: str
    quantity: int
    is_vegetable_or_fruit: bool
    itemAdded: date = Field(default_factory=date.today)


class Notes_Recipe(BaseModel):
    is_recipe: bool
    name: str
    is_veg: bool
    is_fav: bool
    items: List[str]
    instructions: List[str]