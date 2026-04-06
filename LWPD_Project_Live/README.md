# LWPD_Project_Live

A full live web application built on top of `LWPD_Project` with a React frontend and FastAPI backend.

## What This App Provides

- Dataset upload (CSV)
- Live training for Logistic Regression, Decision Tree, and Naive Bayes
- Live train/test evaluation metrics (accuracy, precision, recall, confusion matrix)
- Live prediction endpoint and UI
- Live logs in the UI during training
- Visualizations in UI (Chart.js + saved confusion matrix graphs)
- Backend API + frontend UI + API tests

## Primary/Live Sync Strategy

This app reuses the primary ML logic dynamically from:

- `../LWPD_Project/src/data_loader.py`
- `../LWPD_Project/src/model_training.py`
- `../LWPD_Project/src/evaluation.py`

Because the live app imports these modules at runtime and reloads them when files change, updates in `LWPD_Project` are reflected in new live training runs automatically.

## Folder Structure

- `app/main.py` backend API
- `app/services/primary_bridge.py` runtime bridge to primary project modules
- `frontend/` React app (Vite)
- `tests/` backend API tests
- `results/graphs/` live generated plot artifacts
- `data/` uploaded dataset storage

## Run Backend

1. Open terminal in `LWPD_Project_Live`
2. Create/activate environment
3. Install backend dependencies:

```bash
pip install -r requirements.txt
```

4. Start backend:

```bash
python -m uvicorn app.main:app --app-dir "D:\\PROJECTS\\Collage_Projects\\AWT_Project\\LWPD_Project_Live" --reload --host 127.0.0.1 --port 8000
```

Backend URL:

```text
http://127.0.0.1:8000
```

Recommended runtime: Python 3.11 on this machine. Python 3.14 may require local source builds for `matplotlib`.

## Run Frontend (React)

1. Open a second terminal in `LWPD_Project_Live/frontend`
2. Install frontend dependencies:

```bash
npm install
```

3. Start frontend:

```bash
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

## Test

```bash
pytest -q
```

## API Overview

- `GET /api/health` app health
- `POST /api/upload` upload dataset CSV
- `POST /api/train` start training job
- `GET /api/status` current state, metrics, errors
- `GET /api/logs?after=<id>` incremental log stream
- `GET /api/graphs` list generated graph files
- `GET /api/download/graph/<filename>` download graph file
- `POST /api/predict` URL prediction after training

## Download Features in App

- Download PNG of accuracy chart directly from React UI
- Download PNG of precision/recall chart directly from React UI
- Download each confusion matrix graph from React UI
- Download all available generated graph files from one list

## Notes

- The live app is intentionally separate from `LWPD_Project`.
- It reads the primary code but does not modify primary files.
- Re-run training after primary-code changes to apply latest behavior.
