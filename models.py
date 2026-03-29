from pydantic import BaseModel


class Pokemon(BaseModel):
    number: int
    name: str
    types: list[str]
    total: int
    hit_points: int
    attack: int
    defense: int
    special_attack: int
    special_defense: int
    speed: int
    generation: int
    legendary: bool
    image_url: str
    captured: bool


class PokemonListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: list[Pokemon]


class CapturedResponse(BaseModel):
    captured: bool


class CapturedListResponse(BaseModel):
    captured_ids: list[int]
