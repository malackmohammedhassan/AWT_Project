import { memo } from "react";
import type { ExperimentRun } from "../../api/experiments/experimentsTypes";

type ModelRegistryTableProps = {
  runs: ExperimentRun[];
  selectedRunIds: string[];
  onToggleRun: (runId: string) => void;
  onRunIdClick?: (run: ExperimentRun) => void;
  maxSelection: number;
};

function ModelRegistryTableComponent({
  runs,
  selectedRunIds,
  onToggleRun,
  onRunIdClick,
  maxSelection,
}: ModelRegistryTableProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-medium text-slate-100">Model Registry Table</h3>
        <p className="text-xs text-slate-400">
          Selected: {selectedRunIds.length}/{maxSelection}
        </p>
      </div>

      <div className="max-h-[290px] overflow-auto rounded-md border border-slate-700">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="text-left text-slate-300">
              <th className="px-3 py-2">Compare</th>
              <th className="px-3 py-2">Run ID</th>
              <th className="px-3 py-2">Model</th>
              <th className="px-3 py-2">Dataset</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Accuracy</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const selected = selectedRunIds.includes(run.id);
              const lock = !selected && selectedRunIds.length >= maxSelection;
              return (
                <tr key={run.id} className="border-t border-slate-800 text-slate-200">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={lock}
                      onChange={() => onToggleRun(run.id)}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {run.status === "success" ? (
                      <button
                        type="button"
                        onClick={() => onRunIdClick?.(run)}
                        className="text-sky-300 underline-offset-2 hover:underline"
                      >
                        {run.id}
                      </button>
                    ) : (
                      run.id
                    )}
                  </td>
                  <td className="px-3 py-2">{run.modelName}</td>
                  <td className="px-3 py-2">{run.datasetName}</td>
                  <td className="px-3 py-2">
                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-1 text-xs",
                        run.status === "success" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300",
                      ].join(" ")}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{(run.accuracy * 100).toFixed(2)}%</td>
                  <td className="px-3 py-2">{new Date(run.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const ModelRegistryTable = memo(ModelRegistryTableComponent);
