import { useMemo } from "react";
import { ChartPanelSkeleton } from "./ChartPanelSkeleton";
import { PanelErrorState } from "./PanelErrorState";
import { usePipelineFlow } from "../hooks/usePipelineFlow";

function getStageColor(status: "optimal" | "warning" | "error") {
  if (status === "optimal") {
    return {
      fill: "rgba(16, 185, 129, 0.16)",
      stroke: "#10b981",
      text: "#d1fae5",
    };
  }
  if (status === "warning") {
    return {
      fill: "rgba(245, 158, 11, 0.18)",
      stroke: "#f59e0b",
      text: "#fef3c7",
    };
  }
  return {
    fill: "rgba(239, 68, 68, 0.16)",
    stroke: "#ef4444",
    text: "#fee2e2",
  };
}

type PipelineProcessFlowProps = {
  onStageClick?: (stageName: string) => void;
};

export function PipelineProcessFlow({ onStageClick }: PipelineProcessFlowProps) {
  const { data, isLoading, isError, error, refetch } = usePipelineFlow();

  const stages = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return <ChartPanelSkeleton titleWidthClass="w-48" bodyHeightClass="h-28" />;
  }

  if (isError) {
    return (
      <PanelErrorState
        title="Error Loading Data"
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-medium text-slate-100">Pipeline Process Flow</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">Optimal</span>
          <span className="rounded-full bg-amber-500/20 px-2 py-1 text-amber-200">Warning</span>
          <span className="rounded-full bg-red-500/20 px-2 py-1 text-red-200">Error</span>
        </div>
      </div>

      <svg viewBox="0 0 1000 95" className="w-full">
        {stages.map((stage, index) => {
          const x = index * 196;
          const palette = getStageColor(stage.status);
          const points = `${x},12 ${x + 168},12 ${x + 184},37 ${x + 168},62 ${x},62 ${x + 14},37`;

          return (
            <g key={stage.id}>
              <polygon points={points} fill={palette.fill} stroke={palette.stroke} strokeWidth="1.6" />
              <text
                x={x + 92}
                y={40}
                textAnchor="middle"
                fill={palette.text}
                className="cursor-pointer text-[12px]"
                onClick={() => onStageClick?.(stage.name)}
              >
                {stage.name}
              </text>
              <text x={x + 92} y={79} textAnchor="middle" fill="#94a3b8" className="text-[10px]">
                {stage.step}
              </text>
              {index < stages.length - 1 ? (
                <text x={x + 185} y={40} fill="#64748b" className="text-[14px]">
                  {">"}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </section>
  );
}
