import { memo, useMemo } from "react";
import type { ParallelAxis, ParallelLine } from "../../api/prediction/predictionTypes";

type ParallelCoordinatesProps = {
  axes: ParallelAxis[];
  lines: ParallelLine[];
};

function scaleY(value: number, min: number, max: number, height: number): number {
  const range = max - min || 1;
  const normalized = (value - min) / range;
  return 18 + (1 - normalized) * (height - 36);
}

function buildLinePath(line: ParallelLine, axes: ParallelAxis[], width: number, height: number): string {
  if (axes.length === 0) {
    return "";
  }

  const step = axes.length > 1 ? (width - 40) / (axes.length - 1) : 0;

  return axes
    .map((axis, idx) => {
      const x = 20 + idx * step;
      const value = line.values[axis.key] ?? axis.min;
      const y = scaleY(value, axis.min, axis.max, height);
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function ParallelCoordinatesComponent({ axes, lines }: ParallelCoordinatesProps) {
  const width = 680;
  const height = 290;

  const rendered = useMemo(() => {
    const background = lines.filter((line) => !line.highlight);
    const highlight = lines.find((line) => line.highlight) ?? null;

    return {
      background: background.map((line) => ({ id: line.id, d: buildLinePath(line, axes, width, height) })),
      highlight: highlight ? { id: highlight.id, d: buildLinePath(highlight, axes, width, height) } : null,
    };
  }, [lines, axes]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-4xl font-medium text-slate-100">Parallel Coordinates Chart</h3>
      <div className="overflow-x-auto rounded-md border border-slate-700 bg-slate-900/70 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[290px] w-full min-w-[640px]">
          {axes.map((axis, idx) => {
            const x = 20 + (axes.length > 1 ? ((width - 40) / (axes.length - 1)) * idx : 0);
            return (
              <g key={axis.key}>
                <line x1={x} y1={16} x2={x} y2={height - 18} stroke="rgba(148,163,184,0.35)" strokeWidth="1.4" />
                <text x={x} y={12} fill="#94a3b8" fontSize="10" textAnchor="middle">
                  {axis.label}
                </text>
                <text x={x} y={height - 4} fill="#64748b" fontSize="9" textAnchor="middle">
                  {axis.min} - {axis.max}
                </text>
              </g>
            );
          })}

          {rendered.background.map((line) => (
            <path key={line.id} d={line.d} stroke="rgba(148,163,184,0.38)" strokeWidth="1.2" fill="none" />
          ))}

          {rendered.highlight ? (
            <path d={rendered.highlight.d} stroke="#22d3ee" strokeWidth="2.8" fill="none" />
          ) : null}
        </svg>
      </div>
    </section>
  );
}

export const ParallelCoordinates = memo(ParallelCoordinatesComponent);
