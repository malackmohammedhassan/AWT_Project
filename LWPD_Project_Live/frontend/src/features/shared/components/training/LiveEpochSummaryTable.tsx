import { memo } from "react";
import type { EpochSummaryRow } from "../../api/trainingTypes";

type LiveEpochSummaryTableProps = {
  rows: EpochSummaryRow[];
};

function LiveEpochSummaryTableComponent({ rows }: LiveEpochSummaryTableProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">Live Epoch Summary</h3>
      <div className="max-h-[280px] overflow-auto rounded-md border border-slate-700">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="text-left text-slate-300">
              <th className="px-3 py-2">Epoch #</th>
              <th className="px-3 py-2">Learning Rate</th>
              <th className="px-3 py-2">Loss</th>
              <th className="px-3 py-2">Accuracy</th>
              <th className="px-3 py-2">Validation Acc.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.epoch} className="border-t border-slate-800 text-slate-200">
                <td className="px-3 py-2">{row.epoch}</td>
                <td className="px-3 py-2">{row.learningRate.toExponential(1)}</td>
                <td className="px-3 py-2">{row.loss.toFixed(4)}</td>
                <td className="px-3 py-2">{(row.accuracy * 100).toFixed(2)}%</td>
                <td className="px-3 py-2">{(row.validationAccuracy * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const LiveEpochSummaryTable = memo(LiveEpochSummaryTableComponent);
