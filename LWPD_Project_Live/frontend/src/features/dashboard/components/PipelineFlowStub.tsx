const stages = [
  { id: "ingest", label: "Data Ingestion", status: "optimal" },
  { id: "transform", label: "Transform", status: "optimal" },
  { id: "train", label: "Train", status: "warning" },
  { id: "deploy", label: "Deploy", status: "error" },
  { id: "monitor", label: "Monitor", status: "error" },
] as const;

function stageClass(status: (typeof stages)[number]["status"]) {
  if (status === "optimal") {
    return "border-emerald-400/60 bg-emerald-500/20 text-emerald-200";
  }
  if (status === "warning") {
    return "border-amber-400/60 bg-amber-500/20 text-amber-200";
  }
  return "border-red-400/60 bg-red-500/20 text-red-200";
}

export function PipelineFlowStub() {
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

      <svg viewBox="0 0 1000 90" className="w-full">
        {stages.map((stage, index) => {
          const x = index * 195;
          const points = `${x},10 ${x + 165},10 ${x + 180},35 ${x + 165},60 ${x},60 ${x + 15},35`;
          return (
            <g key={stage.id}>
              <polygon points={points} className={stageClass(stage.status)} strokeWidth="1.5" />
              <text x={x + 90} y={39} textAnchor="middle" className="fill-current text-[12px]">
                {stage.label}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
