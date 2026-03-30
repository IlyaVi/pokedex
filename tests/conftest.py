import pytest
from fastapi.testclient import TestClient

import data as data_module
import state
from main import app

FAKE_POKEMON = [
    {"number": 1, "name": "Bulbasaur", "type_one": "Grass", "type_two": "Poison", "total": 318, "hit_points": 45, "attack": 49, "defense": 49, "special_attack": 65, "special_defense": 65, "speed": 45, "generation": 1, "legendary": False},
    {"number": 2, "name": "Ivysaur", "type_one": "Grass", "type_two": "Poison", "total": 405, "hit_points": 60, "attack": 62, "defense": 63, "special_attack": 80, "special_defense": 80, "speed": 60, "generation": 1, "legendary": False},
    {"number": 3, "name": "Venusaur", "type_one": "Grass", "type_two": "Poison", "total": 525, "hit_points": 80, "attack": 82, "defense": 83, "special_attack": 100, "special_defense": 100, "speed": 80, "generation": 1, "legendary": False},
    {"number": 4, "name": "Charmander", "type_one": "Fire", "type_two": "", "total": 309, "hit_points": 39, "attack": 52, "defense": 43, "special_attack": 60, "special_defense": 50, "speed": 65, "generation": 1, "legendary": False},
    {"number": 5, "name": "Charmeleon", "type_one": "Fire", "type_two": "", "total": 405, "hit_points": 58, "attack": 64, "defense": 58, "special_attack": 80, "special_defense": 65, "speed": 80, "generation": 1, "legendary": False},
    {"number": 6, "name": "Charizard", "type_one": "Fire", "type_two": "Flying", "total": 534, "hit_points": 78, "attack": 84, "defense": 78, "special_attack": 109, "special_defense": 85, "speed": 100, "generation": 1, "legendary": False},
    {"number": 7, "name": "Squirtle", "type_one": "Water", "type_two": "", "total": 314, "hit_points": 44, "attack": 48, "defense": 65, "special_attack": 50, "special_defense": 64, "speed": 43, "generation": 1, "legendary": False},
    {"number": 8, "name": "Wartortle", "type_one": "Water", "type_two": "", "total": 405, "hit_points": 59, "attack": 63, "defense": 80, "special_attack": 65, "special_defense": 80, "speed": 58, "generation": 1, "legendary": False},
    {"number": 9, "name": "Blastoise", "type_one": "Water", "type_two": "", "total": 530, "hit_points": 79, "attack": 83, "defense": 100, "special_attack": 85, "special_defense": 105, "speed": 78, "generation": 1, "legendary": False},
    {"number": 25, "name": "Pikachu", "type_one": "Electric", "type_two": "", "total": 320, "hit_points": 35, "attack": 55, "defense": 40, "special_attack": 50, "special_defense": 50, "speed": 90, "generation": 1, "legendary": False},
    {"number": 26, "name": "Raichu", "type_one": "Electric", "type_two": "", "total": 485, "hit_points": 60, "attack": 90, "defense": 55, "special_attack": 90, "special_defense": 80, "speed": 110, "generation": 1, "legendary": False},
    {"number": 39, "name": "Jigglypuff", "type_one": "Normal", "type_two": "Fairy", "total": 270, "hit_points": 115, "attack": 45, "defense": 20, "special_attack": 45, "special_defense": 25, "speed": 20, "generation": 1, "legendary": False},
]


@pytest.fixture(autouse=True)
def reset_captured():
    data_module.get_all.cache_clear()
    state.captured_ids.clear()
    yield
    state.captured_ids.clear()


@pytest.fixture
def client(mocker):
    mocker.patch("db.get", return_value=FAKE_POKEMON)
    return TestClient(app)
