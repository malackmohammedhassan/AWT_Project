import { memo } from "react";
import type { TrainingStatus } from "../../api/trainingTypes";

type TrainingControlsProps = {
  status: TrainingStatus;
  progressPercent: number;
  onStart: () => void;
  onStop: () => void;
  onSave: () => void;
  saving: boolean;
};

function TrainingControlsComponent({
  status,
  progressPercent,
  onStart,
  onStop,
  onSave,
  saving,
}: TrainingControlsProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-300">State: {status}</p>
        <p className="text-sm text-slate-300">Progress: {progressPercent}%</p>
      </div>

      <div className="mb-4 h-2.5 rounded-full bg-slate-700">
        <div
          className="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={status === "TRAINING" || status === "CONFIGURING"}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 font-medium text-emerald-100 disabled:opacity-40"
        >
          Start Training
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={status !== "TRAINING"}
          className="rounded-lg border border-red-500/40 bg-red-500/20 px-4 py-2 font-medium text-red-100 disabled:opacity-40"
        >
          Stop Training
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={status !== "COMPLETED" || saving}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 font-medium text-emerald-100 disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Model"}
        </button>
      </div>
    </section>
  );
}

export const TrainingControls = memo(TrainingControlsComponent);
