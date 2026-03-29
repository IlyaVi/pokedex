# Pokédex

A fullstack Pokédex app with a FastAPI backend and React frontend featuring infinite scroll, filtering, sorting, and capture tracking.

## Project Structure

```
pokedex/
├── main.py              # FastAPI app entry point
├── models.py            # Pydantic response models
├── state.py             # In-memory capture state
├── db.py                # Pokemon data access (read-only)
├── pokemon_db.json      # Pokemon dataset (800 entries)
├── requirements.txt     # Python dependencies
├── Dockerfile           # Backend container
├── docker-compose.yml   # Multi-service orchestration
├── routers/
│   ├── pokemon.py       # GET /api/pokemon, /api/pokemon/types, /api/pokemon/{n}/image
│   └── captured.py      # GET/POST/DELETE /api/captured
├── tests/
│   ├── conftest.py
│   ├── test_pokemon.py
│   └── test_captured.py
└── frontend/
    ├── Dockerfile       # Frontend container (nginx)
    ├── nginx.conf       # SPA + /api/ proxy config
    ├── package.json
    └── src/
        ├── App.tsx
        ├── types.ts
        ├── index.css
        ├── components/
        │   ├── PokemonList.tsx
        │   ├── PokemonCard.tsx
        │   ├── FilterBar.tsx
        │   ├── ThemeToggle.tsx
        │   └── ui/          # shadcn/ui components
        ├── hooks/
        │   ├── usePokemonInfinite.ts
        │   ├── useScrollPosition.ts
        │   └── useTheme.ts
        ├── lib/
        │   └── api.ts
        └── __tests__/
```

## Running Locally

### Backend

Requires Python 3.12+.

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

Requires Node.js 20+ and pnpm.

```bash
cd frontend
pnpm install
pnpm dev
```

App available at `http://localhost:5173`. Expects the backend running at `http://localhost:8000`.

### Backend Tests

```bash
pytest tests/
```

### Frontend Tests

```bash
cd frontend
pnpm test
```

## Running with Docker

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

The frontend container proxies `/api/` requests to the backend, so no CORS configuration is needed in production.

To stop:

```bash
docker compose down
```
