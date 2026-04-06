import { useMemo } from "react";
import { useSelectedDataset } from "../../../../contexts/SelectedDatasetContext";
import { useDatasetData } from "../../hooks/datasets/useDatasetData";
import { DatasetPanelError } from "./DatasetPanelError";
import { DatasetPanelSkeleton } from "./DatasetPanelSkeleton";

function valueToAlpha(value: string | number): number {
  if (typeof value !== "number") {
    return 0;
  }
  const normalized = Math.max(0, Math.min(1, value / 400));
  return Number((0.08 + normalized * 0.32).toFixed(2));
}

export function DatasetDataGrid() {
  const { selectedDatasetId } = useSelectedDataset();
  const { data, isLoading, isError, error, refetch } = useDatasetData(selectedDatasetId);

  const rows = useMemo(() => data?.rows ?? [], [data]);
  const columns = useMemo(() => data?.columns ?? [], [data]);

  if (isLoading) {
    return <DatasetPanelSkeleton titleWidthClass="w-40" heightClass="h-[520px]" />;
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
      <h3 className="mb-3 text-2xl font-medium text-slate-100">Head of Data</h3>
      <div className="max-h-[520px] overflow-auto rounded-lg border border-slate-700">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-800">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-slate-700 px-3 py-2 text-left font-medium text-slate-300">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={`${row.feature}-${rowIdx}`} className="border-b border-slate-800/70">
                {columns.map((column) => {
                  const value = row[column.key];
                  const alpha = valueToAlpha(value);
                  const style =
                    typeof value === "number"
                      ? { backgroundColor: `rgba(16, 185, 129, ${alpha})` }
                      : undefined;
                  return (
                    <td key={column.key} className="px-3 py-2 text-slate-200" style={style}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
