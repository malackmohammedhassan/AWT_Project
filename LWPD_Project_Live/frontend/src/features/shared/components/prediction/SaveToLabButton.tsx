import { memo } from "react";

type SaveToLabButtonProps = {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
};

function SaveToLabButtonComponent({ onClick, disabled, loading }: SaveToLabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-5 py-3 text-4xl font-semibold text-emerald-100 disabled:opacity-40"
    >
      {loading ? "Saving..." : "Save prediction analysis to Experiment Lab"}
    </button>
  );
}

export const SaveToLabButton = memo(SaveToLabButtonComponent);
