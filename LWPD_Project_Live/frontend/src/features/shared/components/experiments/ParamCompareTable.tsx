import { memo } from "react";
import type { ParamCompareItem } from "../../api/experiments/experimentsTypes";

type ParamCompareTableProps = {
  items: ParamCompareItem[];
};

function ParamCompareTableComponent({ items }: ParamCompareTableProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">Parameter Comparison Table</h3>
      <div className="max-h-[260px] overflow-auto rounded-md border border-slate-700">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="text-left text-slate-300">
              <th className="px-3 py-2">Run ID</th>
              <th className="px-3 py-2">Model</th>
              <th className="px-3 py-2">LR</th>
              <th className="px-3 py-2">Batch</th>
              <th className="px-3 py-2">Epochs</th>
              <th className="px-3 py-2">Features</th>
              <th className="px-3 py-2">Train Time(s)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.runId} className="border-t border-slate-800 text-slate-200">
                <td className="px-3 py-2">{item.runId}</td>
                <td className="px-3 py-2">{item.modelName}</td>
                <td className="px-3 py-2">{item.learningRate.toFixed(4)}</td>
                <td className="px-3 py-2">{item.batchSize}</td>
                <td className="px-3 py-2">{item.epochs}</td>
                <td className="px-3 py-2">{item.featureCount}</td>
                <td className="px-3 py-2">{item.trainTimeSec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const ParamCompareTable = memo(ParamCompareTableComponent);
