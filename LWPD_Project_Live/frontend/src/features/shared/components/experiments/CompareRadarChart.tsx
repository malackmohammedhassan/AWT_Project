import { memo, useMemo } from "react";
import type { RadarMetricKey, RadarSeries } from "../../api/experiments/experimentsTypes";

const METRIC_ORDER: RadarMetricKey[] = ["accuracy", "precision", "recall", "f1", "rocAuc"];

type CompareRadarChartProps = {
  series: RadarSeries[];
};

function CompareRadarChartComponent({ series }: CompareRadarChartProps) {
  const size = 340;
  const center = size / 2;
  const radius = 120;

  const rendered = useMemo(() => {
    return series.map((run) => {
      const points = METRIC_ORDER.map((metric, idx) => {
        const angle = -Math.PI / 2 + (idx / METRIC_ORDER.length) * Math.PI * 2;
        const r = run.metrics[metric] * radius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");

      return {
        runId: run.runId,
        label: run.label,
        color: run.color,
        points,
      };
    });
  }, [series]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">Radar Chart (Spider Plot)</h3>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-[340px] w-full max-w-[360px]">
          {[0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
            <circle
              key={ratio}
              cx={center}
              cy={center}
              r={radius * ratio}
              fill="none"
              stroke="rgba(148,163,184,0.22)"
              strokeWidth="1"
            />
          ))}

          {METRIC_ORDER.map((metric, idx) => {
            const angle = -Math.PI / 2 + (idx / METRIC_ORDER.length) * Math.PI * 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            const lx = center + Math.cos(angle) * (radius + 18);
            const ly = center + Math.sin(angle) * (radius + 18);
            return (
              <g key={metric}>
                <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(148,163,184,0.3)" />
                <text x={lx} y={ly} fill="#94a3b8" fontSize="10" textAnchor="middle">
                  {metric}
                </text>
              </g>
            );
          })}

          {rendered.map((run) => (
            <polygon
              key={run.runId}
              points={run.points}
              fill={run.color}
              fillOpacity="0.16"
              stroke={run.color}
              strokeWidth="2"
            >
              <title>{run.label}</title>
            </polygon>
          ))}
        </svg>

        <div className="flex flex-wrap gap-2 text-xs text-slate-300 xl:max-w-[220px]">
          {rendered.map((run) => (
            <div key={run.runId} className="inline-flex items-center gap-1.5 rounded-md border border-slate-600 px-2 py-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: run.color }} />
              <span>{run.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const CompareRadarChart = memo(CompareRadarChartComponent);
