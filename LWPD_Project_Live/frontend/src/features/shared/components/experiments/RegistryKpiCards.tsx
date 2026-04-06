import { memo } from "react";
import type { ExperimentsKpi } from "../../api/experiments/experimentsTypes";

type RegistryKpiCardsProps = {
  kpi: ExperimentsKpi;
};

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-5xl font-semibold tracking-tight text-slate-100">{value}</p>
    </article>
  );
}

function RegistryKpiCardsComponent({ kpi }: RegistryKpiCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Card label="Total Runs" value={kpi.totalRuns} />
      <Card label="Successful Runs" value={kpi.successfulRuns} />
      <Card label="Compared Models" value={kpi.comparedModels} />
      <Card label="Best Accuracy" value={`${(kpi.bestAccuracy * 100).toFixed(1)}%`} />
    </section>
  );
}

export const RegistryKpiCards = memo(RegistryKpiCardsComponent);
