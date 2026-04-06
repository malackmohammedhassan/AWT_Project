import { memo, useMemo } from "react";

type LiveConfusionMatrixProps = {
  labels: string[];
  matrix: number[][];
};

function colorForValue(value: number, min: number, max: number): string {
  const denominator = max - min || 1;
  const ratio = (value - min) / denominator;
  const clamped = Math.max(0, Math.min(1, ratio));
  const r = Math.round(30 + (1 - clamped) * 70);
  const g = Math.round(40 + clamped * 170);
  const b = Math.round(45 + (1 - clamped) * 40);
  return `rgb(${r}, ${g}, ${b})`;
}

function LiveConfusionMatrixComponent({ labels, matrix }: LiveConfusionMatrixProps) {
  const bounds = useMemo(() => {
    const all = matrix.flat();
    const min = all.length > 0 ? Math.min(...all) : 0;
    const max = all.length > 0 ? Math.max(...all) : 1;
    return { min, max };
  }, [matrix]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">Confusion Matrix Heatmap (for multi-class classif...)</h3>
      <div className="grid gap-1" style={{ gridTemplateColumns: `90px repeat(${labels.length}, minmax(0, 1fr))` }}>
        <div />
        {labels.map((label) => (
          <div key={`x-${label}`} className="truncate text-center text-xs text-slate-400">
            {label}
          </div>
        ))}

        {matrix.map((row, rowIdx) => (
          <div key={`m-row-${labels[rowIdx] ?? rowIdx}`} className="contents">
            <div className="truncate pr-2 text-xs text-slate-400">{labels[rowIdx] ?? `Class ${rowIdx + 1}`}</div>
            {row.map((value, colIdx) => (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="flex h-11 items-center justify-center rounded text-sm font-semibold text-slate-100"
                style={{ backgroundColor: colorForValue(value, bounds.min, bounds.max) }}
              >
                {value}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export const LiveConfusionMatrix = memo(LiveConfusionMatrixComponent);
