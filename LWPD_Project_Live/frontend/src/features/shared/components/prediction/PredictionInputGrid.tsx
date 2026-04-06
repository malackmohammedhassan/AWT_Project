import { memo } from "react";
import type { PredictionSample } from "../../api/prediction/predictionTypes";

type PredictionInputGridProps = {
  samples: PredictionSample[];
  activeSampleId: string;
  onSampleChange: (sampleId: string) => void;
};

function PredictionInputGridComponent({ samples, activeSampleId, onSampleChange }: PredictionInputGridProps) {
  const active = samples.find((item) => item.id === activeSampleId) ?? samples[0];

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-medium text-slate-100">Data inputs</h3>
        <select
          value={activeSampleId}
          onChange={(event) => onSampleChange(event.target.value)}
          className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          {samples.map((sample) => (
            <option key={sample.id} value={sample.id}>
              {sample.label}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-[220px] overflow-auto rounded-lg border border-slate-700">
        <table className="w-full min-w-[620px] border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="text-left text-slate-300">
              <th className="px-3 py-2">Feature</th>
              <th className="px-3 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(active.features).map(([key, value]) => (
              <tr key={key} className="border-t border-slate-800 text-slate-200">
                <td className="px-3 py-2">{key}</td>
                <td className="px-3 py-2">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const PredictionInputGrid = memo(PredictionInputGridComponent);
