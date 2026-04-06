import { useMemo } from "react";
import { useSelectedDataset } from "../../../../contexts/SelectedDatasetContext";
import { useDatasetStats } from "../../hooks/datasets/useDatasetStats";
import { DatasetPanelError } from "./DatasetPanelError";
import { DatasetPanelSkeleton } from "./DatasetPanelSkeleton";

function MiniHistogramBlue({ values }: { values: { x: number; y: number }[] }) {
  const maxY = Math.max(...values.map((item) => item.y), 1);
  return (
    <svg viewBox="0 0 120 70" className="h-full w-full">
      {values.map((item, idx) => {
        const width = 8;
        const gap = 2;
        const x = idx * (width + gap);
        const normalized = item.y / maxY;
        const height = Math.max(2, normalized * 60);
        return <rect key={item.x} x={x} y={66 - height} width={width} height={height} fill="#60a5fa" opacity="0.75" />;
      })}
    </svg>
  );
}

export function HistogramMatrixNumerical() {
  const { selectedDatasetId } = useSelectedDataset();
  const { data, isLoading, isError, error, refetch } = useDatasetStats(selectedDatasetId);

  const cells = useMemo(() => data?.histogramNumerical ?? [], [data]);

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
      <h3 className="mb-3 text-xl font-medium text-slate-100">Histogram Matrix of all</h3>
      <div className="grid grid-cols-3 gap-2">
        {cells.map((cell) => (
          <article key={cell.label} className="rounded-md border border-slate-700 bg-slate-900/60 p-2">
            <p className="truncate text-xs text-slate-400">{cell.label}</p>
            <div className="h-16">
              <MiniHistogramBlue values={cell.bins} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
