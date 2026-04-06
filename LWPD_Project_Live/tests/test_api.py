import io
import time

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["ok"] is True


def test_upload_train_and_predict_flow():
    csv_content = """url,label
https://good-a.com,0
https://good-b.com,0
https://good-c.com,0
https://good-d.com,0
http://phish-a.verify-login.example,1
http://phish-b.verify-login.example,1
http://phish-c.verify-login.example,1
http://phish-d.verify-login.example,1
"""

    files = {"file": ("tiny.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    upload_response = client.post("/api/upload", files=files)
    assert upload_response.status_code == 200

    train_response = client.post("/api/train", json={"use_uploaded": True})
    assert train_response.status_code == 200

    deadline = time.time() + 20
    trained = False
    while time.time() < deadline:
        status_response = client.get("/api/status")
        assert status_response.status_code == 200
        status = status_response.json()
        if not status["training"] and status["has_trained_models"]:
            trained = True
            break
        time.sleep(0.5)

    assert trained is True

    graphs_response = client.get("/api/graphs")
    assert graphs_response.status_code == 200
    graphs_payload = graphs_response.json()
    assert len(graphs_payload["items"]) >= 1

    first_graph_name = graphs_payload["items"][0]["name"]
    download_response = client.get(f"/api/download/graph/{first_graph_name}")
    assert download_response.status_code == 200
    assert download_response.headers["content-type"].startswith("image/png")

    predict_response = client.post("/api/predict", json={"url": "http://verify-user-session.example"})
    assert predict_response.status_code == 200
    payload = predict_response.json()
    assert "final_label" in payload
    assert payload["final_label"] in {"Legit", "Phishing"}
