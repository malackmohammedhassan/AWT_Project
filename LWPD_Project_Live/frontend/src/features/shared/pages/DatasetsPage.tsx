import { WorkflowGuard } from "../../../components/common/WorkflowGuard";
import { useSelectedDataset } from "../../../contexts/SelectedDatasetContext";
import { CorrelationHeatmap } from "../components/datasets/CorrelationHeatmap";
import { DataSourcesNavigator } from "../components/datasets/DataSourcesNavigator";
import { DatasetDataGrid } from "../components/datasets/DatasetDataGrid";
import { DatasetSummaryCards } from "../components/datasets/DatasetSummaryCards";
import { HistogramMatrix } from "../components/datasets/HistogramMatrix";
import { HistogramMatrixNumerical } from "../components/datasets/HistogramMatrixNumerical";
import { MissingValueHeatmap } from "../components/datasets/MissingValueHeatmap";

export function DatasetsPage() {
  const { selectedDatasetId } = useSelectedDataset();

  const content = (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 shadow-md">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-100">Datasets & Visualisation</h2>
        <p className="mt-1 text-sm text-slate-400">Selected dataset: {selectedDatasetId}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <DataSourcesNavigator />
        </div>

        <div className="space-y-4 xl:col-span-9">
          <DatasetSummaryCards />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <DatasetDataGrid />
            </div>
            <div className="space-y-4 xl:col-span-5">
              <CorrelationHeatmap />
              <HistogramMatrix />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <HistogramMatrixNumerical />
            <MissingValueHeatmap />
          </div>
        </div>
      </section>
    </div>
  );

  return <WorkflowGuard requiredStep="upload a dataset">{content}</WorkflowGuard>;
}
