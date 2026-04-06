# LWPD Live App - Implemented Features

## Architecture Overview

Modern enterprise ML platform with **dataset-first workflow enforcement**, built on React 18 + TypeScript with strict type safety, TanStack Query for server state, and SVG-based visualization components.

## Backend

- **FastAPI** server with REST API endpoints
- Dataset upload endpoint (`/api/upload`)
- Background training job endpoint (`/api/train`)
- Status endpoint (`/api/status`)
- Incremental live logs endpoint (`/api/logs`)
- Live prediction endpoint (`/api/predict`)
- Graph static serving from `/graphs`
- Support for dynamic module loading from primary project

## Frontend Architecture

### Core Technology Stack

- **React 18** with TypeScript (strict mode)
- **React Router v6** for multi-page navigation
- **TanStack Query v5** for server state management
- **Context API** for global state (filters, upload state, dataset selection)
- **SVG-based components** for performance-optimized visualizations
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Pages (6-Page Application)

#### 1. **Dashboard Page** (`/dashboard`)

- **Upload Interface**: Drag-and-drop file upload (CSV, XLSX, JSON, Parquet; max 100MB)
- **Workflow Enforcement**: Shows upload form when no dataset, blocks other pages
- **Quick Actions**: Navigation buttons to Train, Predict, Compare after upload
- **KPI Cards**: Active pipelines, models trained, deployed models
- **Pipeline Flow**: Stage-wise visualization
- **Recent Activity**: Model training history with click-through to predictions
- **Data Visualizations**: Error pie charts, execution timelines, throughput metrics

#### 2. **Datasets Page** (`/datasets`)

- **Data Explorer**: Browse available datasets with hierarchical navigation
- **Dataset Summary**: Row count, column count, data quality metrics
- **Data Grid**: Interactive table view with scrolling
- **Statistical Visualizations**:
  - Correlation heatmap
  - Histogram matrix for numerical columns
  - Missing value heatmap
  - Class distribution charts
- **URL State Sync**: Dataset selection persists in query parameters

#### 3. **Training Page** (`/training`)

- **Configuration Panel**:
  - Model type selector (XGBoost, LightGBM, Ensemble)
  - Hyperparameter controls (learning rate, epochs, batch size, validation split)
  - Threshold adjustment
- **Live Monitor**:
  - Stage-wise progress timeline with ETA calculations
  - Real-time log stream (auto-refresh)
  - Metric tracking (loss, accuracy, precision, recall)
  - Live visualization charts
- **Completion Handler**: Registers trained model to experiments registry
- **Loss Metric Click**: Navigate to experiments with model preselection

#### 4. **Prediction Page** (`/prediction`)

- **Model Selection**: Dropdown of deployed models
- **Sample Selection**: Grid of available test samples with preview
- **File Upload**: Upload new data for predictions
- **Inference Engine**: Run explainable predictions
- **Result Output**:
  - Prediction confidence card
  - **Feature Importance**: Teal (positive) / amber (negative) bar chart
  - **Parallel Coordinates**: Multi-axis visualization with current sample highlighted
  - **Feature Breakdown**: Table with individual contributions
  - **Explainability**: SHAP/LIME-style feature analysis
- **Save to Lab**: Register prediction result to experiments registry
- **URL Navigation**: Auto-run with `modelId`, `sampleId`, `autorun=1` parameters

#### 5. **Experiments Lab** (`/experiments`)

- **Model Registry Table**:
  - All trained and uploaded models
  - Selection checkbox (max 5 runs)
  - Clickable run IDs for model details
- **KPI Cards**: Total runs, successful runs, best accuracy, model count
- **Comparison Engine**:
  - **ROC/PR Curves**: Overlapped lines for all selected models (SVG rendered)
  - **Radar Spider Chart**: Accuracy, precision, recall, F1, ROC-AUC comparison (SVG rendered)
  - **Parameter Matrix**: Hyperparameter comparison table
- **Preselection**: `?preselectRunId=<id>` query param auto-selects run
- **Click Navigation**: Running ID links to prediction page with model auto-selected

#### 6. **Shared Pages**

- **WorkflowGuard Wrapper**: All pages require dataset upload before access
  - Shows friendly error page if accessed without dataset
  - Redirects to dashboard for upload

### State Management

#### Global Contexts

1. **UploadDatasetContext**
   - Tracks: `uploadedDataset` (name, size, rows, columns, upload time)
   - Tracks: `isUploading`, `uploadError`
   - Global availability across all pages

2. **GlobalFilterContext**
   - `monthFilter`: Shared across pages for refetch coordination
   - Bound to KPI cards, dataset queries, training metrics

3. **SelectedDatasetContext**
   - `selectedDatasetId`: Current dataset in explorer
   - Bidirectional sync with `?datasetId=` URL parameter

4. **Query Hooks** (TanStack Query)
   - `useDeployedModels()`: Fetch available models for prediction
   - `usePredictionSamples()`: Fetch test samples
   - `useInference()`: Run prediction mutation
   - `useExperimentRuns()`: Fetch model registry
   - `useRunComparison()`: Fetch comparison data for selected runs
   - `useKpiSummary()`: KPI metrics per filter

### Components

#### Dashboard

- `DataUploadComponent`: Drag-drop upload with file validation
- `KpiCard`: Metric display card
- `PipelineProcessFlow`: Stage visualization
- `RecentActivityTable`: Training history
- `ActiveErrorPieChart`, `ExecutionTimeLineChart`, `ThroughputLineChart`, `MairDistributionPieChart`

#### Datasets

- `DataSourcesNavigator`: Hierarchical dataset browser
- `DatasetDataGrid`: Scrollable table view
- `DatasetSummaryCards`: Key statistics
- `CorrelationHeatmap`: SVG correlation matrix
- `HistogramMatrix`: Column distribution visualization
- `MissingValueHeatmap`: Data quality visualization

#### Training

- `ModelTypeConfig`: Model selection dropdown
- `HyperparameterForm`: Config input panel
- `TrainingMonitorParent`: Orchestrates training flow
- `LiveTrainingCurves`: Metric charts with memoization
- `LiveLineChart`: Individual metric line graph

#### Prediction

- `ModelSelector`: Model dropdown
- `PredictionInputGrid`: Sample picker
- `InferenceResultCard`: Prediction output card
- `FeatureImportancePlot`: Feature contribution chart (SVG bars)
- `ParallelCoordinates`: Multi-axis sample visualization (SVG)
- `FeatureBreakdownTable`: Feature-by-feature breakdown
- `SaveToLabButton`: Export to experiments

#### Experiments

- `ModelRegistryTable`: Selection interface with max-5 limit
- `RegistryKpiCards`: Registry statistics
- `CompareCurvesPlot`: Overlapped ROC/PR curves (SVG)
- `CompareRadarChart`: Radar polygon overlay (SVG)
- `ParamCompareTable`: Hyperparameter comparison
- `CompareMatrixHeader`: Selection summary

#### Common

- `WorkflowGuard`: Route protection wrapper (requires uploaded dataset)
- `CardSkeleton`: Loading placeholder
- `ErrorBoundary`: Global error handler

### API Contract Types

All endpoints use **strict TypeScript interfaces**:

- `PredictionResult`: Inference output with SHAP contributions
- `ExperimentRun`: Registry entry with metrics and model ID
- `TrainingConfig`: Hyperparameter contract
- `InferenceInput`: Model ID, sample ID, month filter

### Data Flow Patterns

1. **Upload Workflow**

   ```
   User Upload → UploadDatasetContext → Dashboard Unlocks → All Pages Enabled
   ```

2. **Training Workflow**

   ```
   Config Selection → Run Training → Live Logs → Completion → Experiments Registry
   ```

3. **Prediction Workflow**

   ```
   Model + Sample Selection → Inference Mutation → Result Display → Save to Registry
   ```

4. **Cross-Page Navigation**
   - Dashboard model click → `toPrediction(modelId)` with autorun
   - Dashboard stage click → `toDatasets(datasetId)`
   - Training completion loss click → `toExperiments(experimentId)` preselection
   - Experiments run click → `toPrediction(modelId)` with autorun
   - Prediction save → `toExperiments(experimentId)` preselection

### Visualizations

**SVG-Based Components** (Performance optimized):

- `ParallelCoordinates`: Multi-axis coordinate system with polylines
- `CompareCurvesPlot`: Dual series (ROC solid, PR dashed) overlaid
- `CompareRadarChart`: Polygon overlay with shared axis grid
- `FeatureImportancePlot`: Bidirectional bar chart

**Memoization Strategy**:

- Path builders memoized to prevent re-renders
- Components wrapped with `React.memo` for isolation
- `useMemo` for expensive calculations
- `useCallback` for stable event handlers

## Implemented Phases

- **Phase 4**: Live Training Monitor with real-time log visualization ✅
- **Phase 5**: Prediction & Explainability with SHAP/LIME and Parallel Coordinates ✅
- **Phase 6**: Experiments Lab with multi-run comparison and radar charts ✅
- **Phase 7**: Dynamic Interconnectivity with URL query parameter navigation ✅

## Type Safety

- **Strict TypeScript**: All components and services fully typed
- **Build Verification**: `npm run typecheck` passes with zero errors
- **Discriminated Unions**: Status types prevent invalid state combinations
- **API Contracts**: Deterministic mock data with seeded randomization

## Build Output

- **Module Count**: 1,874 modules transformed
- **Bundle Size**: 478.21 KB (gzip: 151.05 KB)
- **Build Time**: ~4.5 seconds

## Workflow Enforcement

**Dataset-First Architecture**:

- Dashboard shows upload interface first (no mock data)
- All other pages wrapped with `WorkflowGuard`
- Direct URL access to `/training`, `/prediction`, etc. without dataset shows error page
- User cannot access advanced features until dataset is uploaded

## Current Limitations

- Mock data services (real backend integration needed for production)
- No persistent model storage (in-memory only)
- Polling-based log streams (websocket optional for real-time)
- Mock inference results (placeholder SHAP values)

## Operational Rule

If `LWPD_Project` changes, start a new training run in `LWPD_Project_Live` to use the latest primary logic.
