from fastapi import APIRouter, HTTPException

from data import get_all
import state
from models import CapturedResponse, CapturedListResponse

router = APIRouter()


@router.get("/captured", response_model=CapturedListResponse)
def get_captured():
    with state._lock:
        ids = sorted(state.captured_ids)
    return CapturedListResponse(captured_ids=ids)


@router.post("/pokemon/{number}/capture", response_model=CapturedResponse)
def capture_pokemon(number: int):
    all_pokemon: list[dict] = get_all()
    if not any(p["number"] == number for p in all_pokemon):
        raise HTTPException(status_code=404, detail="Pokemon not found")
    with state._lock:
        state.captured_ids.add(number)
    return CapturedResponse(captured=True)


@router.delete("/pokemon/{number}/capture", response_model=CapturedResponse)
def release_pokemon(number: int):
    with state._lock:
        state.captured_ids.discard(number)
    return CapturedResponse(captured=False)
