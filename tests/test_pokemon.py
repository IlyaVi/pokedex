from tests.conftest import FAKE_POKEMON


def test_list_default_params(client):
    resp = client.get("/api/pokemon")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == len(FAKE_POKEMON)
    assert body["page"] == 1
    assert body["page_size"] == 10
    assert len(body["results"]) == 10


def test_pagination_page2(client):
    resp = client.get("/api/pokemon?page=2&page_size=10")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == len(FAKE_POKEMON)
    assert len(body["results"]) == len(FAKE_POKEMON) - 10


def test_pagination_page_size_5(client):
    resp = client.get("/api/pokemon?page=1&page_size=5")
    assert resp.status_code == 200
    assert len(resp.json()["results"]) == 5


def test_invalid_page_size(client):
    resp = client.get("/api/pokemon?page_size=7")
    assert resp.status_code == 422


def test_sort_asc(client):
    resp = client.get("/api/pokemon?order=asc&page_size=20")
    assert resp.status_code == 200
    numbers = [p["number"] for p in resp.json()["results"]]
    assert numbers == sorted(numbers)


def test_sort_desc(client):
    resp = client.get("/api/pokemon?order=desc&page_size=20")
    assert resp.status_code == 200
    numbers = [p["number"] for p in resp.json()["results"]]
    assert numbers == sorted(numbers, reverse=True)


def test_filter_by_type(client):
    resp = client.get("/api/pokemon?type=water&page_size=20")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 3
    names = {p["name"] for p in body["results"]}
    assert names == {"Squirtle", "Wartortle", "Blastoise"}


def test_filter_by_secondary_type(client):
    resp = client.get("/api/pokemon?type=flying&page_size=20")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 1
    assert body["results"][0]["name"] == "Charizard"


def test_filter_no_match(client):
    resp = client.get("/api/pokemon?type=dragon")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 0
    assert body["results"] == []


def test_search(client):
    resp = client.get("/api/pokemon?search=char&page_size=20")
    assert resp.status_code == 200
    body = resp.json()
    names = {p["name"] for p in body["results"]}
    assert names == {"Charmander", "Charmeleon", "Charizard"}


def test_types_endpoint(client):
    resp = client.get("/api/pokemon/types")
    assert resp.status_code == 200
    types = resp.json()
    assert isinstance(types, list)
    assert "fire" in types
    assert "water" in types
    assert "flying" in types
    assert types == sorted(types)


def test_image_redirect(client):
    resp = client.get("/api/pokemon/4/image", follow_redirects=False)
    assert resp.status_code in (200, 301, 302, 307, 308)


def test_image_not_found(client):
    resp = client.get("/api/pokemon/9999/image")
    assert resp.status_code == 404


def test_page_out_of_range(client):
    resp = client.get("/api/pokemon?page=999")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == len(FAKE_POKEMON)
    assert body["results"] == []


def test_results_include_image_url(client):
    resp = client.get("/api/pokemon")
    assert resp.status_code == 200
    for p in resp.json()["results"]:
        assert p["image_url"].startswith("https://")


def test_results_include_captured_false_by_default(client):
    resp = client.get("/api/pokemon")
    for p in resp.json()["results"]:
        assert p["captured"] is False
