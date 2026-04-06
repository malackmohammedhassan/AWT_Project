from __future__ import annotations

import os
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
import re

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.services.primary_bridge import PrimaryBridge


os.environ.setdefault("MPLBACKEND", "Agg")


BASE_DIR = Path(__file__).resolve().parents[1]
PRIMARY_DIR = BASE_DIR.parent / "LWPD_Project"
DATA_DIR = BASE_DIR / "data"
GRAPH_DIR = BASE_DIR / "results" / "graphs"

DATA_DIR.mkdir(parents=True, exist_ok=True)
GRAPH_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class RuntimeState:
    lock: threading.Lock = field(default_factory=threading.Lock)
    logs: list[dict] = field(default_factory=list)
    log_seq: int = 0
    training: bool = False
    training_error: str | None = None
    uploaded_dataset_path: Path | None = None
    dataset_summary: dict = field(default_factory=dict)
    metrics: list[dict] = field(default_factory=list)
    models: dict = field(default_factory=dict)
    training_started_at: float | None = None
    training_finished_at: float | None = None

    def add_log(self, message: str):
        with self.lock:
            self.log_seq += 1
            self.logs.append({"id": self.log_seq, "ts": int(time.time()), "message": message})


state = RuntimeState()
bridge = PrimaryBridge(PRIMARY_DIR)

app = FastAPI(title="LWPD Live", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TrainRequest(BaseModel):
    use_uploaded: bool = True


class PredictRequest(BaseModel):
    url: str


def _fallback_url_features(url: str) -> dict:
    cleaned = url.strip().lower()
    digits = sum(char.isdigit() for char in cleaned)
    special = sum(char in "?&=_-@:%" for char in cleaned)
    depth = cleaned.count("/")
    return {
        "url_length": float(len(cleaned)),
        "entropy": float(len(set(cleaned)) / max(1, len(cleaned) / 6)),
        "redirects": float(cleaned.count("//") - 1 if "//" in cleaned else 0),
        "special_chars": float(special),
        "path_depth": float(depth),
        "digit_ratio": float(digits / max(1, len(cleaned))),
        "subdomains": float(cleaned.split(".").count("www") + cleaned.count(".")),
    }


def _extract_prediction_features(url: str) -> dict:
    try:
        frame = bridge.build_prediction_features(url)
        row = frame.iloc[0]

        numeric = [float(value) for value in row.tolist() if isinstance(value, (int, float))]
        if len(numeric) >= 7:
            return {
                "url_length": numeric[0],
                "entropy": numeric[1],
                "redirects": numeric[2],
                "special_chars": numeric[3],
                "path_depth": numeric[4],
                "digit_ratio": numeric[5],
                "subdomains": numeric[6],
            }
    except Exception:
        pass

    return _fallback_url_features(url)


@app.get("/")
def index():
    return {
        "app": "LWPD_Project_Live backend",
        "frontend": "Run React frontend from frontend/ with npm run dev",
    }


@app.get("/api/health")
def health():
    return {"ok": True, "primary_project": str(PRIMARY_DIR)}


@app.get("/api/status")
def status():
    with state.lock:
        return {
            "training": state.training,
            "training_error": state.training_error,
            "training_started_at": state.training_started_at,
            "training_finished_at": state.training_finished_at,
            "has_uploaded_dataset": state.uploaded_dataset_path is not None,
            "has_trained_models": bool(state.models),
            "dataset_summary": state.dataset_summary,
            "metrics": state.metrics,
        }


@app.get("/api/logs")
def logs(after: int = 0):
    with state.lock:
        items = [item for item in state.logs if item["id"] > after]
        last_id = state.logs[-1]["id"] if state.logs else 0
    return {"items": items, "last_id": last_id}


@app.get("/api/graphs")
def graphs():
    items = []
    for path in sorted(GRAPH_DIR.glob("*.png")):
        items.append(
            {
                "name": path.name,
                "url": f"/api/download/graph/{path.name}",
            }
        )
    return {"items": items}


@app.get("/api/download/graph/{filename}")
def download_graph(filename: str):
    if not re.fullmatch(r"[A-Za-z0-9_.-]+", filename):
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_path = GRAPH_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Graph file not found")

    return FileResponse(file_path, filename=filename, media_type="image/png")


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    filename = (file.filename or "").strip()
    if not filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    upload_path = DATA_DIR / "uploaded_dataset.csv"
    upload_path.write_bytes(content)

    dataframe = pd.read_csv(upload_path)
    normalized = bridge.normalize_uploaded_dataset(dataframe)

    summary = {
        "filename": filename,
        "rows": int(normalized.shape[0]),
        "columns": list(normalized.columns),
        "class_distribution": {
            str(k): int(v)
            for k, v in normalized["label"].value_counts().sort_index().to_dict().items()
        },
    }

    with state.lock:
        state.uploaded_dataset_path = upload_path
        state.dataset_summary = summary

    state.add_log(f"Dataset uploaded: {filename} ({summary['rows']} rows)")
    return {"message": "Dataset uploaded", "summary": summary}


@app.get("/api/models")
def models():
    with state.lock:
        metrics = list(state.metrics)
        trained_model_names = list(state.models.keys())

    items = []
    if metrics:
        for idx, metric in enumerate(metrics):
            items.append({"id": f"model_class_{idx}", "name": metric.get("model", f"Model {idx + 1}")})
    elif trained_model_names:
        for idx, name in enumerate(trained_model_names):
            items.append({"id": f"model_class_{idx}", "name": name})

    return {"items": items}


@app.get("/api/samples")
def samples(limit: int = 6):
    fallback_urls = [
        "https://secure-bank-login.example.com/account/update",
        "https://github.com/openai",
        "http://verify-now-security-alert.biz/session/reset",
        "https://docs.python.org/3/library/",
        "http://instant-prize-winner.click/claim",
        "https://news.ycombinator.com/",
    ]

    urls: list[str] = []
    with state.lock:
        upload_path = state.uploaded_dataset_path

    if upload_path and upload_path.exists():
        try:
            frame = pd.read_csv(upload_path, nrows=500)
            candidates = ["url", "URL", "link", "website", "domain"]
            url_column = next((col for col in candidates if col in frame.columns), None)

            if url_column:
                values = frame[url_column].dropna().astype(str).head(limit).tolist()
                urls.extend(values)
        except Exception:
            pass

    if not urls:
        urls = fallback_urls[:limit]

    items = []
    for idx, url in enumerate(urls[:limit]):
        items.append(
            {
                "id": f"sample_{idx + 1}",
                "label": f"Sample {idx + 1}",
                "url": url,
                "features": _extract_prediction_features(url),
            }
        )

    return {"items": items}


def _train_job(use_uploaded: bool):
    try:
        state.add_log("Training job started")
        if use_uploaded:
            with state.lock:
                upload_path = state.uploaded_dataset_path
            if upload_path is None:
                raise ValueError("No uploaded dataset found. Upload a dataset first or train on primary dataset.")

            state.add_log(f"Loading uploaded dataset from {upload_path}")
            dataframe = pd.read_csv(upload_path)
            data = bridge.normalize_uploaded_dataset(dataframe)
        else:
            state.add_log("Loading dataset from primary LWPD project")
            data = bridge.load_primary_dataset()

        state.add_log(f"Prepared dataset with {len(data)} rows")

        models, results = bridge.train_and_evaluate(data, GRAPH_DIR, state.add_log)

        metrics = []
        for result in results:
            metrics.append(
                {
                    "model": result["Model"],
                    "accuracy": float(result["Accuracy"]),
                    "precision": float(result["Precision"]),
                    "recall": float(result["Recall"]),
                    "confusion_matrix": result["Confusion Matrix"].tolist(),
                    "confusion_matrix_graph": f"/api/download/graph/{Path(result['Confusion Matrix Path']).name}",
                }
            )

        with state.lock:
            state.models = models
            state.metrics = metrics
            state.training_error = None

        state.add_log("Training job completed successfully")

    except Exception as exc:  # pragma: no cover
        with state.lock:
            state.training_error = str(exc)
            state.models = {}
        state.add_log(f"Training failed: {exc}")
    finally:
        with state.lock:
            state.training = False
            state.training_finished_at = time.time()


@app.post("/api/train")
def train(request: TrainRequest):
    with state.lock:
        if state.training:
            raise HTTPException(status_code=409, detail="A training job is already running")
        state.training = True
        state.training_error = None
        state.training_started_at = time.time()
        state.training_finished_at = None

    thread = threading.Thread(target=_train_job, args=(request.use_uploaded,), daemon=True)
    thread.start()
    return {"message": "Training started", "use_uploaded": request.use_uploaded}


@app.post("/api/predict")
def predict(payload: PredictRequest):
    url = payload.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    with state.lock:
        models = dict(state.models)

    if not models:
        raise HTTPException(status_code=400, detail="Train models first")

    features = bridge.build_prediction_features(url)

    model_outputs = {}
    votes = []
    for model_name, model in models.items():
        prediction = int(model.predict(features)[0])
        model_outputs[model_name] = {
            "prediction": prediction,
            "label": "Phishing" if prediction == 1 else "Legit",
        }
        votes.append(prediction)

    final_prediction = int(round(sum(votes) / len(votes)))

    return {
        "url": url,
        "models": model_outputs,
        "final_prediction": final_prediction,
        "final_label": "Phishing" if final_prediction == 1 else "Legit",
    }
