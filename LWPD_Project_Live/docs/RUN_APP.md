# Run Guide - LWPD_Project_Live

This guide explains how to run the live app: **FastAPI backend** + **React 18 TypeScript frontend** with **dataset-first workflow**.

## New Workflow Architecture

The app now enforces a **proper data science workflow**:

```
1. Upload Dataset → 2. Visualize Data → 3. Train Models → 4. Make Predictions → 5. Analyze Results
```

**Key Change**: The dashboard no longer shows mock data. Users must upload a dataset first to unlock the application. All other pages are protected by workflow guards.

## Prerequisites

- **Python 3.11** installed
- **Node.js 18+** installed
- **Primary project** available at `../LWPD_Project`

## Folder

Open terminals in:

```
D:\PROJECTS\Collage_Projects\AWT_Project\LWPD_Project_Live
```

---

## 1. Run Backend (FastAPI)

### Install Python Dependencies

```powershell
C:\Python311\python.exe -m pip install -r requirements.txt
```

### Start Backend Server

```powershell
C:\Python311\python.exe -m uvicorn app.main:app --app-dir "D:\PROJECTS\Collage_Projects\AWT_Project\LWPD_Project_Live" --reload --host 127.0.0.1 --port 8000
```

**Backend URL:**

```
http://127.0.0.1:8000
```

**Health Check:**

```
curl http://127.0.0.1:8000/api/health
```

---

## 2. Run Frontend (React)

### Open New Terminal

Move to frontend directory:

```powershell
Set-Location "D:\PROJECTS\Collage_Projects\AWT_Project\LWPD_Project_Live\frontend"
```

### Install Frontend Dependencies

```powershell
npm install
```

### Start React Development Server

```powershell
npm run dev
```

**Frontend URL:**

```
http://127.0.0.1:5173
```

---

## 3. Using the Application

### Step 1: Upload Dataset (Dashboard)

1. Open http://127.0.0.1:5173 in browser
2. You'll see the **Dataset Upload Interface** (no mock data shown)
3. Click **"Choose File"** or drag & drop a file
4. **Supported formats**: `.csv`, `.xlsx`, `.json`, `.parquet` (max 100MB)
5. Wait for upload to complete (~1.5 seconds)
6. Success message shows: filename, row count, column count, upload timestamp

### Step 2: Explore Datasets (Datasets Page)

1. Click the **"Visualize Data"** action card from dashboard
2. Navigate datasets in the left sidebar (hierarchical folder structure)
3. View dataset statistics:
   - Summary cards (rows, columns, unique values)
   - Data grid (interactive table)
   - Correlation heatmap
   - Histogram distributions
   - Missing value visualization

### Step 3: Configure & Train Models (Training Page)

1. Click **"Train Models"** action card from dashboard
2. **Select Model Type**:
   - XGBoost
   - LightGBM
   - Ensemble
3. **Adjust Hyperparameters**:
   - Learning rate: 0.0001 - 0.01
   - Epochs: 50 - 200
   - Batch size: 8 - 64
   - Validation split: 0.1 - 0.3
   - Decision threshold: 0.3 - 0.7
4. Click **"Start Training"** button
5. **Live Monitor** displays:
   - Stage-wise progress timeline
   - Real-time log stream
   - ETA calculations
   - Live metric charts (loss, accuracy, precision, recall)
6. Training completion automatically registers model to Experiments registry

### Step 4: Make Predictions (Prediction Page)

1. Click **"Make Predictions"** action card from dashboard
2. **Select a Model**: Dropdown of all trained models
3. **Choose Sample**: Grid of test samples
4. Click **"Run Prediction"** button
5. **View Results**:
   - Prediction confidence card
   - Feature importance chart (positive/negative contributions)
   - Parallel coordinates visualization
   - Feature breakdown table
6. Click **"Save to Lab"** to register prediction

### Step 5: Compare Model Performance (Experiments Lab)

1. Click **"Compare Results"** action card from dashboard
2. **Model Registry Table**:
   - Browse all trained models and predictions
   - Checkbox select up to 5 runs
3. Click **"Compare Selected Runs"** button
4. **Comparison Visualizations**:
   - **ROC/PR Curves**: Overlapped performance curves
   - **Radar Spider Chart**: Multi-metric comparison (accuracy, precision, recall, F1, ROC-AUC)
   - **Parameter Matrix**: Hyperparameter comparison
5. Click run IDs to jump back to Prediction page with model preselected

---

## 4. Understanding Page Navigation

### Workflow Enforcement

All pages require an uploaded dataset. If you try to access:

- `/training` directly without upload → Shows error page redirecting to dashboard
- `/prediction` directly without upload → Shows error page
- `/experiments` directly without upload → Shows error page
- `/datasets` directly without upload → Shows error page

### Cross-Page Navigation

**Dashboard Pages**:

- Click a model name in Recent Activity → Jumps to Prediction page with that model auto-selected
- Click a pipeline stage → Jumps to Datasets page

**Training Pages**:

- Click loss metric on completed training → Jumps to Experiments with model preselected

**Experiments Pages**:

- Click a run ID → Jumps to Prediction page with model auto-selected

**URL Parameters** (Bookmarkable):

- `/prediction?modelId=model_class_1&sampleId=sample_2&autorun=1` → Auto-runs inference
- `/experiments?preselectRunId=exp_123` → Preselects run for comparison
- `/datasets?datasetId=transactions_sql` → Shows specific dataset

---

## 5. Build & Deployment

### Type Checking

```powershell
cd frontend
npm run typecheck
```

Expected: **Zero type errors**

### Production Build

```powershell
cd frontend
npm run build
```

Output:

- `dist/` folder with optimized build
- ~478 KB bundle (gzip: 151 KB)
- Ready for deployment

### Build Verification

- **1,874 modules** transformed
- **4.5 seconds** build time
- **Zero TypeScript errors**

---

## 6. Testing

### Backend Tests

From `LWPD_Project_Live` folder:

```powershell
C:\Python311\python.exe -m pytest -q
```

Runs:

- API smoke test (`/api/health`)
- Upload → train → predict integration test

---

## 7. Troubleshooting

| Issue                                 | Solution                                              |
| ------------------------------------- | ----------------------------------------------------- |
| **Frontend shows "Dataset Required"** | Upload a file first from dashboard upload interface   |
| **Frontend cannot call API**          | Verify backend is running on `http://127.0.0.1:8000`  |
| **Backend fails to start**            | Check if port 8000 is busy; use `--port 8001` instead |
| **Training page blocked**             | You need to upload dataset on dashboard first         |
| **No models in Prediction page**      | Train at least one model first                        |
| **Comparison shows no data**          | Select 1+ runs and click "Compare Selected Runs"      |
| **Charts look empty**                 | Run a complete training job first                     |
| **Port 5173 already in use**          | Run `npm run dev -- --port 5174` instead              |
| **Dependencies missing**              | Run `npm install` in frontend folder                  |

---

## 8. Advanced: If Primary Project Changes

The live backend can dynamically load logic from `../LWPD_Project/src/`.

**After updating primary project**:

1. Optionally restart backend: `Ctrl+C` then re-run uvicorn
2. Trigger a new training run in the UI
3. New run will use updated primary logic

---

## Development Workflow

### Recommended Setup

**Terminal 1 (Backend)**:

```powershell
cd LWPD_Project_Live
C:\Python311\python.exe -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend)**:

```powershell
cd LWPD_Project_Live/frontend
npm run dev
```

**Open Browser**: `http://127.0.0.1:5173`

### Frontend Development Notes

- **Hot reload**: Changes to React components instantly reflect
- **TypeScript strict mode**: All files must type-check
- **ESLint**: Code style checked automatically
- **CSS**: Tailwind CSS utility-first approach
