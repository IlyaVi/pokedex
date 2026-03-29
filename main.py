from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import pokemon, captured

app = FastAPI(title="Pokédex API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pokemon.router, prefix="/api")
app.include_router(captured.router, prefix="/api")
