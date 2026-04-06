import { useSelectedDataset } from "../../../../contexts/SelectedDatasetContext";
import { useDatasetSummary } from "../../hooks/datasets/useDatasetSummary";
import { DatasetPanelError } from "./DatasetPanelError";

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-5xl font-semibold tracking-tight text-slate-100">{value}</p>
    </article>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, idx) => (
        <div key={idx} className="h-[110px] animate-pulse rounded-xl border border-slate-700 bg-slate-800" />
      ))}
    </div>
  );
}

export function DatasetSummaryCards() {
  const { selectedDatasetId } = useSelectedDataset();
  const { data, isLoading, isError, error, refetch } = useDatasetSummary(selectedDatasetId);

  if (isLoading) {
    return <SummarySkeleton />;
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

  const summary = data ?? {
    totalRows: 0,
    features: 0,
    missingDataPercent: 0,
    uniqueValues: 0,
  };

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Total Rows" value={summary.totalRows} />
      <SummaryCard label="Features" value={summary.features} />
      <SummaryCard label="Missing Data %" value={`${summary.missingDataPercent}%`} />
      <SummaryCard label="Unique Values" value={summary.uniqueValues} />
    </section>
  );
}
