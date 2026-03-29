from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from typing import Optional
import re

import db
import state
from models import Pokemon, PokemonListResponse

router = APIRouter()

ALLOWED_PAGE_SIZES = {5, 10, 20}


def _name_to_slug(name: str) -> str:
    slug = name.lower()
    slug = slug.replace("♀", "-f").replace("♂", "-m")
    slug = re.sub(r"[^a-z0-9\-]", "", slug.replace(" ", "-").replace(".", "").replace("'", ""))
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug


def _build_pokemon(raw: dict, captured: bool) -> Pokemon:
    types = [raw["type_one"]]
    if raw.get("type_two"):
        types.append(raw["type_two"])
    return Pokemon(
        number=raw["number"],
        name=raw["name"],
        types=types,
        total=raw["total"],
        hit_points=raw["hit_points"],
        attack=raw["attack"],
        defense=raw["defense"],
        special_attack=raw["special_attack"],
        special_defense=raw["special_defense"],
        speed=raw["speed"],
        generation=raw["generation"],
        legendary=raw["legendary"],
        image_url=f"https://img.pokemondb.net/sprites/silver/normal/{_name_to_slug(raw['name'])}.png",
        captured=captured,
    )


@router.get("/pokemon", response_model=PokemonListResponse)
def list_pokemon(
    page: int = Query(1, ge=1),
    page_size: int = Query(10),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    if page_size not in ALLOWED_PAGE_SIZES:
        raise HTTPException(
            status_code=422,
            detail=f"page_size must be one of {sorted(ALLOWED_PAGE_SIZES)}",
        )

    data: list[dict] = db.get()

    if type:
        type_lower = type.lower()
        data = [
            p for p in data
            if p["type_one"].lower() == type_lower
            or (p.get("type_two") and p["type_two"].lower() == type_lower)
        ]

    if search:
        search_lower = search.lower()
        data = [
            p for p in data
            if any(search_lower in str(v).lower() for v in p.values())
        ]

    data.sort(key=lambda p: p["number"], reverse=(order == "desc"))

    total = len(data)
    start = (page - 1) * page_size
    page_data = data[start: start + page_size]

    captured_snapshot = state.captured_ids.copy()
    results = [_build_pokemon(p, p["number"] in captured_snapshot) for p in page_data]

    return PokemonListResponse(total=total, page=page, page_size=page_size, results=results)


@router.get("/pokemon/types")
def list_types() -> list[str]:
    data: list[dict] = db.get()
    types: set[str] = set()
    for p in data:
        types.add(p["type_one"].lower())
        if p.get("type_two"):
            types.add(p["type_two"].lower())
    return sorted(types)


@router.get("/pokemon/{number}/image")
def get_image(number: int):
    data: list[dict] = db.get()
    pokemon = next((p for p in data if p["number"] == number), None)
    if not pokemon:
        raise HTTPException(status_code=404, detail="Pokemon not found")
    slug = _name_to_slug(pokemon["name"])
    return RedirectResponse(url=f"https://img.pokemondb.net/sprites/silver/normal/{slug}.png")
