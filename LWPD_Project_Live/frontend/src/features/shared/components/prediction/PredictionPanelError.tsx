import { AlertTriangle } from "lucide-react";

type PredictionPanelErrorProps = {
  message: string;
  onRetry?: () => void;
};

export function PredictionPanelError({ message, onRetry }: PredictionPanelErrorProps) {
  return (
    <section className="rounded-xl border border-red-400/40 bg-red-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
        <div>
          <p className="font-medium text-red-200">Error Loading Data</p>
          <p className="text-sm text-red-100/80">{message}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg border border-red-300/40 bg-red-500/20 px-3 py-1.5 text-sm text-red-100"
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
