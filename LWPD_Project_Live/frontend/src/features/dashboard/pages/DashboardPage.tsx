import { AlertTriangle, ArrowRight, BarChart3, Zap, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CardSkeleton } from "../../../components/common/CardSkeleton";
import { DataUploadComponent } from "../components/DataUploadComponent";
import { ActiveErrorPieChart } from "../components/ActiveErrorPieChart";
import { ExecutionTimeLineChart } from "../components/ExecutionTimeLineChart";
import { KpiCard } from "../components/KpiCard";
import { MairDistributionPieChart } from "../components/MairDistributionPieChart";
import { PipelineProcessFlow } from "../components/PipelineProcessFlow";
import { RecentActivityTable } from "../components/RecentActivityTable";
import { ThroughputLineChart } from "../components/ThroughputLineChart";
import { useKpiSummary } from "../hooks/useKpiSummary";
import { useGlobalNavigate } from "../../../hooks/useGlobalNavigate";
import { useUploadDataset } from "../../../contexts/UploadDatasetContext";

export function DashboardPage() {
  const navigate = useNavigate();
  const { toPrediction, toDatasets } = useGlobalNavigate();
  const { uploadedDataset } = useUploadDataset();
  const { data, isLoading, isError, error, refetch } = useKpiSummary();

  function mapModelNameToId(modelName: string): string {
    const normalized = modelName.toLowerCase();
    if (normalized.includes("xgboost")) {
      return "model_class_0";
    }
    if (normalized.includes("lightgbm") || normalized.includes("executor")) {
      return "model_class_1";
    }
    return "model_ensemble";
  }

  function handleModelClick(modelName: string) {
    toPrediction({
      modelId: mapModelNameToId(modelName),
      sampleId: "sample_1",
      autoRun: true,
    });
  }

  function handleStageClick(stageName: string) {
    const normalized = stageName.toLowerCase();
    if (normalized.includes("data ingestion") || normalized.includes("transform")) {
      toDatasets("customer_churn_csv");
    }
  }

  const kpiSummary = data ?? {
    activePipelines: 0,
    modelsTrained: 0,
    deployedModels: 0,
  };

  // If no dataset is uploaded, show the upload interface
  if (!uploadedDataset) {
    return (
      <div className="space-y-8">
        {/* Upload Section */}
        <DataUploadComponent
          onUploadSuccess={() => {
            // Optional: scroll or navigate after upload
          }}
        />

        {/* Workflow Guide */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-blue-600/40 bg-blue-600/10 p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-blue-600/40 p-2">
                <BarChart3 className="h-5 w-5 text-blue-300" />
              </div>
              <span className="text-sm font-semibold text-blue-300">Step 1: Visualize</span>
            </div>
            <p className="text-sm text-blue-100/80">
              Upload your dataset to explore statistics, data quality, and distribution patterns
            </p>
          </div>

          <div className="rounded-xl border border-purple-600/40 bg-purple-600/10 p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-purple-600/40 p-2">
                <Zap className="h-5 w-5 text-purple-300" />
              </div>
              <span className="text-sm font-semibold text-purple-300">Step 2: Train</span>
            </div>
            <p className="text-sm text-purple-100/80">
              Configure models and train them on your data to find the best performing model
            </p>
          </div>

          <div className="rounded-xl border border-cyan-600/40 bg-cyan-600/10 p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-cyan-600/40 p-2">
                <BookOpen className="h-5 w-5 text-cyan-300" />
              </div>
              <span className="text-sm font-semibold text-cyan-300">Step 3: Predict</span>
            </div>
            <p className="text-sm text-cyan-100/80">
              Use trained models to make predictions and understand feature importance
            </p>
          </div>
        </div>

        {/* Getting Started Info */}
        <div className="rounded-xl border border-gray-600/40 bg-gray-900/40 p-6">
          <h3 className="mb-3 font-semibold text-white">Getting Started</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span>Upload a CSV, XLSX, JSON, or Parquet file (max 100MB)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span>The platform will analyze your data and display key statistics</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span>Navigate to Training to start building ML models</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span>Use trained models in the Prediction page for inference and explainability</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // If dataset is uploaded, show the full dashboard
  return (
    <div className="space-y-5">
      {/* Dataset Info Banner */}
      <div className="rounded-xl border border-green-600/40 bg-green-600/10 px-6 py-4">
        <p className="text-sm text-green-100">
          <span className="font-semibold">Dataset Active:</span> {uploadedDataset.fileName} •{" "}
          <span className="text-green-200">{uploadedDataset.rowCount?.toLocaleString()}</span> rows •{" "}
          <span className="text-green-200">{uploadedDataset.columnCount}</span> columns
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : isError ? (
          <div className="xl:col-span-3 rounded-xl border border-red-400/40 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
              <div>
                <p className="font-medium text-red-200">Failed to load KPI summary</p>
                <p className="text-sm text-red-100/80">{error.message}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-3 rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-1.5 text-sm text-red-100"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <KpiCard
              title="Active Pipelines"
              value={kpiSummary.activePipelines}
              subtitle="Training jobs in progress"
            />
            <KpiCard
              title="Models Trained"
              value={kpiSummary.modelsTrained}
              subtitle="Total trained models"
            />
            <KpiCard
              title="Deployed Models"
              value={kpiSummary.deployedModels}
              subtitle="Ready for predictions"
            />
          </>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={() => navigate("/training")}
          className="group rounded-xl border border-purple-600/40 bg-purple-600/10 p-6 transition-all hover:border-purple-500/60 hover:bg-purple-600/20"
        >
          <div className="mb-3 flex items-center justify-between">
            <Zap className="h-6 w-6 text-purple-400" />
            <ArrowRight className="h-4 w-4 text-purple-400/60 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mb-1 font-semibold text-white">Train Models</h3>
          <p className="text-sm text-purple-100/80">
            Build and configure ML models on your dataset
          </p>
        </button>

        <button
          onClick={() => navigate("/prediction")}
          className="group rounded-xl border border-blue-600/40 bg-blue-600/10 p-6 transition-all hover:border-blue-500/60 hover:bg-blue-600/20"
        >
          <div className="mb-3 flex items-center justify-between">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <ArrowRight className="h-4 w-4 text-blue-400/60 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mb-1 font-semibold text-white">Make Predictions</h3>
          <p className="text-sm text-blue-100/80">
            Use trained models for inference
          </p>
        </button>

        <button
          onClick={() => navigate("/experiments")}
          className="group rounded-xl border border-cyan-600/40 bg-cyan-600/10 p-6 transition-all hover:border-cyan-500/60 hover:bg-cyan-600/20"
        >
          <div className="mb-3 flex items-center justify-between">
            <BarChart3 className="h-6 w-6 text-cyan-400" />
            <ArrowRight className="h-4 w-4 text-cyan-400/60 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="mb-1 font-semibold text-white">Compare Results</h3>
          <p className="text-sm text-cyan-100/80">
            Analyze model performance metrics
          </p>
        </button>
      </section>

      <PipelineProcessFlow onStageClick={handleStageClick} />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <ActiveErrorPieChart />
        </div>
        <div className="lg:col-span-6">
          <ExecutionTimeLineChart />
        </div>
        <div className="lg:col-span-3">
          <ThroughputLineChart />
        </div>
        <div className="lg:col-span-3">
          <MairDistributionPieChart />
        </div>
        <div className="lg:col-span-9">
          <RecentActivityTable onModelClick={handleModelClick} />
        </div>
      </section>
    </div>
  );
}
