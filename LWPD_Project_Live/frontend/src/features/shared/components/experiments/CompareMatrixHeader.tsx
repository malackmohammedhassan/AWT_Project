import { memo } from "react";

type CompareMatrixHeaderProps = {
  selectedCount: number;
};

function CompareMatrixHeaderComponent({ selectedCount }: CompareMatrixHeaderProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="text-xl font-medium text-slate-100">Compare Matrix</h3>
      <p className="mt-1 text-sm text-slate-400">
        Select up to five runs and click Compare to render overlapped curves, radar polygons, and parameter matrix.
      </p>
      <p className="mt-2 text-xs text-slate-400">Selected runs: {selectedCount}</p>
    </section>
  );
}

export const CompareMatrixHeader = memo(CompareMatrixHeaderComponent);
