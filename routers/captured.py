from fastapi import APIRouter, HTTPException

import db
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
    data: list[dict] = db.get()
    if not any(p["number"] == number for p in data):
        raise HTTPException(status_code=404, detail="Pokemon not found")
    with state._lock:
        state.captured_ids.add(number)
    return CapturedResponse(captured=True)


@router.delete("/pokemon/{number}/capture", response_model=CapturedResponse)
def release_pokemon(number: int):
    with state._lock:
        state.captured_ids.discard(number)
    return CapturedResponse(captured=False)
