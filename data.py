import functools
import db


@functools.lru_cache(maxsize=1)
def get_all() -> list[dict]:
    """Return the full pokemon dataset, cached after the first call."""
    return db.get()
