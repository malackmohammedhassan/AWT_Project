import { memo, useMemo } from "react";
import type { FeatureImportanceItem } from "../../api/prediction/predictionTypes";

type FeatureImportancePlotProps = {
  items: FeatureImportanceItem[];
};

function FeatureImportancePlotComponent({ items }: FeatureImportancePlotProps) {
  const sorted = useMemo(() => [...items].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)), [items]);
  const maxAbs = useMemo(() => Math.max(...sorted.map((item) => Math.abs(item.contribution)), 0.01), [sorted]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-4xl font-medium text-slate-100">SHAP or LIME Feature Importance Plot</h3>
      <div className="space-y-2">
        {sorted.map((item) => {
          const width = Math.round((Math.abs(item.contribution) / maxAbs) * 46);
          const isPositive = item.contribution >= 0;

          return (
            <div key={item.feature} className="grid grid-cols-[180px_1fr_1fr] items-center gap-2 text-sm">
              <p className="truncate text-slate-300">{item.feature}</p>
              <div className="flex justify-end">
                {!isPositive ? (
                  <div
                    className="h-6 rounded-l bg-amber-400"
                    style={{ width: `${width}%` }}
                    title={item.contribution.toFixed(3)}
                  />
                ) : (
                  <div className="h-6" />
                )}
              </div>
              <div className="flex justify-start">
                {isPositive ? (
                  <div
                    className="h-6 rounded-r bg-sky-400"
                    style={{ width: `${width}%` }}
                    title={item.contribution.toFixed(3)}
                  />
                ) : (
                  <div className="h-6" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Negative decision</span>
        <span>Positive decision</span>
      </div>
    </section>
  );
}

export const FeatureImportancePlot = memo(FeatureImportancePlotComponent);
