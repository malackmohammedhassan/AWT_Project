import { useState } from "react";
import { ChartPanelSkeleton } from "./ChartPanelSkeleton";
import { PanelErrorState } from "./PanelErrorState";
import { useActivityFeed } from "../hooks/useActivityFeed";

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

function StatusBadge({ status }: { status: "success" | "failure" }) {
  if (status === "success") {
    return (
      <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
        Success
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300">
      Failure
    </span>
  );
}

type RecentActivityTableProps = {
  onModelClick?: (modelName: string) => void;
};

export function RecentActivityTable({ onModelClick }: RecentActivityTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { data, isLoading, isError, error, refetch } = useActivityFeed(page, pageSize);
  const tableData = data ?? {
    page,
    pageSize,
    total: pageSize,
    items: [],
  };

  if (isLoading) {
    return <ChartPanelSkeleton titleWidthClass="w-44" bodyHeightClass="h-60" />;
  }

  if (isError) {
    return (
      <PanelErrorState
        title="Error Loading Data"
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(tableData.total / tableData.pageSize));

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-100">Recent Activity Feed</h3>
        <p className="text-xs text-slate-400">
          Page {tableData.page} of {totalPages}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-300">
              <th className="px-3 py-2 font-medium">Timestamp</th>
              <th className="px-3 py-2 font-medium">Model Name</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {tableData.items.map((item) => (
              <tr key={`${item.timestamp}-${item.modelName}`} className="border-b border-slate-800/80">
                <td className="px-3 py-2 text-slate-300">{formatTimestamp(item.timestamp)}</td>
                <td className="px-3 py-2 text-slate-200">
                  <button
                    type="button"
                    onClick={() => onModelClick?.(item.modelName)}
                    className="text-left text-sky-300 underline-offset-2 hover:underline"
                  >
                    {item.modelName}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages}
          className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  );
}
