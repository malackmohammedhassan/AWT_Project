import { memo, useMemo } from "react";
import type { LiveMetricPoint } from "../../api/trainingTypes";

type SeriesDefinition = {
  key: "trainingLoss" | "validationLoss" | "trainingAccuracy" | "validationAccuracy";
  label: string;
  color: string;
};

type LiveLineChartProps = {
  title: string;
  yLabel: string;
  points: LiveMetricPoint[];
  series: SeriesDefinition[];
  yDomain: [number, number];
  onMetricClick?: () => void;
  metricClickable?: boolean;
};

function mapY(value: number, min: number, max: number, height: number): number {
  if (max === min) {
    return height - 8;
  }
  const normalized = (value - min) / (max - min);
  return height - 18 - normalized * (height - 36);
}

function buildPath(values: number[], width: number, height: number, min: number, max: number): string {
  if (values.length === 0) {
    return "";
  }

  const innerWidth = width - 28;
  const step = values.length > 1 ? innerWidth / (values.length - 1) : 0;

  return values
    .map((value, idx) => {
      const x = 14 + idx * step;
      const y = mapY(value, min, max, height);
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function LiveLineChartComponent({
  title,
  yLabel,
  points,
  series,
  yDomain,
  onMetricClick,
  metricClickable = false,
}: LiveLineChartProps) {
  const width = 640;
  const height = 280;

  const lines = useMemo(() => {
    return series.map((item) => {
      const values = points.map((point) => point[item.key]);
      return {
        ...item,
        d: buildPath(values, width, height, yDomain[0], yDomain[1]),
      };
    });
  }, [points, series, yDomain]);

  const ticks = useMemo(() => {
    const [min, max] = yDomain;
    return Array.from({ length: 5 }, (_, idx) => {
      const value = min + ((max - min) / 4) * idx;
      const y = mapY(value, min, max, height);
      return { value, y };
    });
  }, [yDomain]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">{title}</h3>
      <div className="overflow-hidden rounded-md border border-slate-700 bg-slate-900/70 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[280px] w-full">
          {ticks.map((tick) => (
            <g key={tick.value}>
              <line x1="10" y1={tick.y} x2={width - 8} y2={tick.y} stroke="rgba(148,163,184,0.18)" strokeWidth="1" />
              <text x="4" y={tick.y - 2} fill="#94a3b8" fontSize="10">
                {tick.value.toFixed(2)}
              </text>
            </g>
          ))}

          {lines.map((line) => (
            <path key={line.label} d={line.d} stroke={line.color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
          ))}
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-300">
        {series.map((line) => (
          <div key={line.label} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.color }} />
            <span>{line.label}</span>
          </div>
        ))}
      </div>
      {metricClickable ? (
        <button
          type="button"
          onClick={onMetricClick}
          className="mt-1 text-xs text-amber-300 underline-offset-2 hover:underline"
        >
          {yLabel}
        </button>
      ) : (
        <p className="mt-1 text-xs text-slate-400">{yLabel}</p>
      )}
    </section>
  );
}

export const LiveLineChart = memo(LiveLineChartComponent);
