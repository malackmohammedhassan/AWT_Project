import { useMemo } from "react";
import { useSelectedDataset } from "../../../../contexts/SelectedDatasetContext";
import { useDatasetStats } from "../../hooks/datasets/useDatasetStats";
import { DatasetPanelError } from "./DatasetPanelError";
import { DatasetPanelSkeleton } from "./DatasetPanelSkeleton";

function heatColor(value: number): string {
  if (value >= 0.75) {
    return "rgba(16, 185, 129, 0.9)";
  }
  if (value >= 0.45) {
    return "rgba(34, 197, 94, 0.75)";
  }
  if (value >= 0.2) {
    return "rgba(148, 163, 184, 0.55)";
  }
  return "rgba(30, 41, 59, 0.95)";
}

export function MissingValueHeatmap() {
  const { selectedDatasetId } = useSelectedDataset();
  const { data, isLoading, isError, error, refetch } = useDatasetStats(selectedDatasetId);

  const matrix = useMemo(() => data?.missingValueHeatmap ?? { labels: [], values: [] }, [data]);

  if (isLoading) {
    return <DatasetPanelSkeleton titleWidthClass="w-44" heightClass="h-[300px]" />;
  }

  if (isError) {
    return (
      <DatasetPanelError
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const yLabels = ["Churn", "Contract", "Streaming", "Billing", "Support", "Region"];

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">Missing Value Heatmap</h3>
      <div className="grid gap-1" style={{ gridTemplateColumns: `84px repeat(${matrix.labels.length}, minmax(0, 1fr))` }}>
        <div />
        {matrix.labels.map((label) => (
          <div key={label} className="truncate text-center text-xs text-slate-400">
            {label}
          </div>
        ))}

        {matrix.values.map((row, rowIdx) => (
          <div key={`missing-row-${rowIdx}`} className="contents">
            <div key={`row-${rowIdx}`} className="pr-2 text-xs text-slate-400">
              {yLabels[rowIdx] ?? `Row ${rowIdx + 1}`}
            </div>
            {row.map((value, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className="h-9 rounded"
                style={{ backgroundColor: heatColor(value) }}
                title={value.toFixed(2)}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
