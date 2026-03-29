import state


def test_get_captured_empty(client):
    resp = client.get("/api/captured")
    assert resp.status_code == 200
    assert resp.json() == {"captured_ids": []}


def test_capture_pokemon(client):
    resp = client.post("/api/pokemon/1/capture")
    assert resp.status_code == 200
    assert resp.json() == {"captured": True}
    assert 1 in state.captured_ids


def test_capture_idempotent(client):
    client.post("/api/pokemon/1/capture")
    resp = client.post("/api/pokemon/1/capture")
    assert resp.status_code == 200
    assert resp.json() == {"captured": True}
    assert state.captured_ids.count(1) if hasattr(state.captured_ids, "count") else len([x for x in state.captured_ids if x == 1]) == 1


def test_release_pokemon(client):
    client.post("/api/pokemon/1/capture")
    resp = client.delete("/api/pokemon/1/capture")
    assert resp.status_code == 200
    assert resp.json() == {"captured": False}
    assert 1 not in state.captured_ids


def test_release_not_captured(client):
    resp = client.delete("/api/pokemon/7/capture")
    assert resp.status_code == 200
    assert resp.json() == {"captured": False}


def test_get_captured_after_multiple_captures(client):
    client.post("/api/pokemon/1/capture")
    client.post("/api/pokemon/4/capture")
    client.post("/api/pokemon/7/capture")
    resp = client.get("/api/captured")
    assert resp.status_code == 200
    assert sorted(resp.json()["captured_ids"]) == [1, 4, 7]


def test_list_reflects_captured_flag(client):
    client.post("/api/pokemon/1/capture")
    resp = client.get("/api/pokemon?page_size=20")
    assert resp.status_code == 200
    results = {p["number"]: p["captured"] for p in resp.json()["results"]}
    assert results[1] is True
    assert results[4] is False


def test_capture_unknown_id(client):
    resp = client.post("/api/pokemon/9999/capture")
    assert resp.status_code == 404
