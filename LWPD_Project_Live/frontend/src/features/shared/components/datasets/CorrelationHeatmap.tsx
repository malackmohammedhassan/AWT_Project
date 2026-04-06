import { useMemo } from "react";
import { useSelectedDataset } from "../../../../contexts/SelectedDatasetContext";
import { useDatasetStats } from "../../hooks/datasets/useDatasetStats";
import { DatasetPanelError } from "./DatasetPanelError";
import { DatasetPanelSkeleton } from "./DatasetPanelSkeleton";

function cellColor(value: number): string {
  if (value >= 0.75) {
    return "#10b981";
  }
  if (value >= 0.4) {
    return "#84cc16";
  }
  if (value >= 0.1) {
    return "#eab308";
  }
  return "#ef4444";
}

export function CorrelationHeatmap() {
  const { selectedDatasetId } = useSelectedDataset();
  const { data, isLoading, isError, error, refetch } = useDatasetStats(selectedDatasetId);

  const matrix = useMemo(() => data?.correlation ?? { labels: [], values: [] }, [data]);

  if (isLoading) {
    return <DatasetPanelSkeleton titleWidthClass="w-56" heightClass="h-[300px]" />;
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

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">Feature Correlation Heatmap</h3>
      <div className="grid gap-1" style={{ gridTemplateColumns: `110px repeat(${matrix.labels.length}, minmax(0, 1fr))` }}>
        <div />
        {matrix.labels.map((label) => (
          <div key={label} className="truncate text-center text-xs text-slate-400">
            {label}
          </div>
        ))}

        {matrix.values.map((row, rowIdx) => (
          <div key={`corr-row-${rowIdx}`} className="contents">
            <div key={`label-${matrix.labels[rowIdx]}`} className="truncate pr-2 text-xs text-slate-400">
              {matrix.labels[rowIdx]}
            </div>
            {row.map((value, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className="flex h-9 items-center justify-center rounded text-xs font-medium text-slate-100"
                style={{ backgroundColor: cellColor(value) }}
                title={value.toFixed(2)}
              >
                {value.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
