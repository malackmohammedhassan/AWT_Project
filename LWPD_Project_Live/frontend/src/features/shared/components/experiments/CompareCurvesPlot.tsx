import { memo, useMemo } from "react";
import type { RunCurveSeries } from "../../api/experiments/experimentsTypes";

type CompareCurvesPlotProps = {
  series: RunCurveSeries[];
};

function buildPath(points: { x: number; y: number }[], width: number, height: number): string {
  return points
    .map((point, idx) => {
      const x = 30 + point.x * (width - 60);
      const y = 20 + (1 - point.y) * (height - 44);
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function CompareCurvesPlotComponent({ series }: CompareCurvesPlotProps) {
  const width = 720;
  const height = 320;

  const rendered = useMemo(() => {
    return series.map((run) => ({
      id: run.runId,
      label: run.label,
      color: run.color,
      rocPath: buildPath(run.roc, width, height),
      prPath: buildPath(run.pr, width, height),
    }));
  }, [series]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">ROC & Precision Curves (Compare)</h3>
      <div className="overflow-x-auto rounded-md border border-slate-700 bg-slate-900/70 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[320px] w-full min-w-[700px]">
          {Array.from({ length: 6 }, (_, idx) => {
            const y = 20 + ((height - 44) / 5) * idx;
            return <line key={`h-${idx}`} x1="30" y1={y} x2={width - 30} y2={y} stroke="rgba(148,163,184,0.18)" />;
          })}
          {Array.from({ length: 6 }, (_, idx) => {
            const x = 30 + ((width - 60) / 5) * idx;
            return <line key={`v-${idx}`} x1={x} y1="20" x2={x} y2={height - 24} stroke="rgba(148,163,184,0.15)" />;
          })}

          {rendered.map((run) => (
            <g key={run.id}>
              <path d={run.rocPath} stroke={run.color} strokeWidth="2.5" fill="none" opacity="0.95">
                <title>{`${run.label} ROC`}</title>
              </path>
              <path d={run.prPath} stroke={run.color} strokeWidth="2" fill="none" opacity="0.45" strokeDasharray="5 4">
                <title>{`${run.label} PR`}</title>
              </path>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
        {rendered.map((run) => (
          <div key={run.id} className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-2 py-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: run.color }} />
            <span>{run.label} (solid=ROC, dashed=PR)</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export const CompareCurvesPlot = memo(CompareCurvesPlotComponent);
