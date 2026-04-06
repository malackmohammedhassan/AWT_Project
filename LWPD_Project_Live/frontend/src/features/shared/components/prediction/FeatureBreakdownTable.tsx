import { memo } from "react";
import type { FeatureBreakdownItem } from "../../api/prediction/predictionTypes";

type FeatureBreakdownTableProps = {
  items: FeatureBreakdownItem[];
};

function FeatureBreakdownTableComponent({ items }: FeatureBreakdownTableProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-4xl font-medium text-slate-100">Feature-Level breakdown table</h3>
      <div className="max-h-[180px] overflow-auto rounded-md border border-slate-700">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="text-left text-slate-300">
              <th className="px-3 py-2">Feature #</th>
              <th className="px-3 py-2">Feature</th>
              <th className="px-3 py-2">Positive Score</th>
              <th className="px-3 py-2">Negative Score</th>
              <th className="px-3 py-2">Missing Data %</th>
              <th className="px-3 py-2">Unique Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.feature} className="border-t border-slate-800 text-slate-200">
                <td className="px-3 py-2">{idx + 1}</td>
                <td className="px-3 py-2">{item.feature}</td>
                <td className="px-3 py-2">{item.positiveScore.toFixed(2)}</td>
                <td className="px-3 py-2 text-red-300">{item.negativeScore.toFixed(2)}</td>
                <td className="px-3 py-2">{item.missingDataPercent.toFixed(2)}</td>
                <td className="px-3 py-2">{item.uniqueValues}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const FeatureBreakdownTable = memo(FeatureBreakdownTableComponent);
