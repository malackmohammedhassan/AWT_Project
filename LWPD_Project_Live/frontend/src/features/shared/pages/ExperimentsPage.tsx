import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WorkflowGuard } from "../../../components/common/WorkflowGuard";
import { useGlobalNavigate } from "../../../hooks/useGlobalNavigate";
import { CompareCurvesPlot } from "../components/experiments/CompareCurvesPlot";
import { CompareMatrixHeader } from "../components/experiments/CompareMatrixHeader";
import { CompareRadarChart } from "../components/experiments/CompareRadarChart";
import { ExperimentsPanelError } from "../components/experiments/ExperimentsPanelError";
import { ExperimentsPanelSkeleton } from "../components/experiments/ExperimentsPanelSkeleton";
import { ModelRegistryTable } from "../components/experiments/ModelRegistryTable";
import { ParamCompareTable } from "../components/experiments/ParamCompareTable";
import { RegistryKpiCards } from "../components/experiments/RegistryKpiCards";
import { useExperimentRuns } from "../hooks/experiments/useExperimentRuns";
import { useExperimentsKpi } from "../hooks/experiments/useExperimentsKpi";
import { useRunComparison } from "../hooks/experiments/useRunComparison";

const MAX_SELECTION = 5;

export function ExperimentsPage() {
  const runsQuery = useExperimentRuns();
  const kpiQuery = useExperimentsKpi();
  const runComparison = useRunComparison();
  const { toPrediction } = useGlobalNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);

  const runs = runsQuery.data ?? [];
  const kpi = kpiQuery.data ?? {
    totalRuns: 0,
    successfulRuns: 0,
    comparedModels: 0,
    bestAccuracy: 0,
  };
  const preselectRunId = searchParams.get("preselectRunId");

  useEffect(() => {
    runComparison.reset();
  }, [runsQuery.data, kpiQuery.data]);

  useEffect(() => {
    if (!preselectRunId) {
      return;
    }
    if (!runs.some((run) => run.id === preselectRunId)) {
      return;
    }
    setSelectedRunIds((previous) => {
      if (previous.includes(preselectRunId)) {
        return previous;
      }
      return [preselectRunId, ...previous].slice(0, MAX_SELECTION);
    });

    const next = new URLSearchParams(searchParams);
    next.delete("preselectRunId");
    setSearchParams(next, { replace: true });
  }, [preselectRunId, runs, searchParams, setSearchParams]);

  const canCompare = selectedRunIds.length > 0 && !runComparison.isPending;
  const comparisonData = runComparison.data;

  function toggleRunSelection(runId: string) {
    setSelectedRunIds((previous) => {
      if (previous.includes(runId)) {
        return previous.filter((id) => id !== runId);
      }
      if (previous.length >= MAX_SELECTION) {
        return previous;
      }
      return [...previous, runId];
    });
  }

  async function runCompare() {
    if (selectedRunIds.length === 0) {
      return;
    }
    await runComparison.mutateAsync(selectedRunIds);
  }

  function handleRunIdClick(modelId: string) {
    toPrediction({
      modelId,
      sampleId: "sample_1",
      autoRun: true,
    });
  }

  const hasComparison = useMemo(() => {
    return Boolean(comparisonData && selectedRunIds.length > 0);
  }, [comparisonData, selectedRunIds.length]);

  if (runsQuery.isLoading || kpiQuery.isLoading) {
    return (
      <div className="space-y-4">
        <ExperimentsPanelSkeleton titleWidthClass="w-72" heightClass="h-16" />
        <ExperimentsPanelSkeleton titleWidthClass="w-48" heightClass="h-40" />
        <ExperimentsPanelSkeleton titleWidthClass="w-52" heightClass="h-72" />
      </div>
    );
  }

  if (runsQuery.isError) {
    return <ExperimentsPanelError message={runsQuery.error.message} onRetry={() => void runsQuery.refetch()} />;
  }

  if (kpiQuery.isError) {
    return <ExperimentsPanelError message={kpiQuery.error.message} onRetry={() => void kpiQuery.refetch()} />;
  }

  const content = (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 shadow-md">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-100">Experiments Lab & Visualisation</h2>
      </section>

      <RegistryKpiCards kpi={kpi} />

      <ModelRegistryTable
        runs={runs}
        selectedRunIds={selectedRunIds}
        onToggleRun={toggleRunSelection}
        onRunIdClick={(run) => handleRunIdClick(run.modelId)}
        maxSelection={MAX_SELECTION}
      />

      <CompareMatrixHeader selectedCount={selectedRunIds.length} />

      <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-300">Selected IDs: {selectedRunIds.join(", ") || "None"}</p>
          <button
            type="button"
            onClick={() => {
              void runCompare();
            }}
            disabled={!canCompare}
            className="rounded-lg border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-100 disabled:opacity-40"
          >
            {runComparison.isPending ? "Comparing..." : "Compare Selected Runs"}
          </button>
        </div>
      </section>

      {runComparison.isError ? <ExperimentsPanelError message={runComparison.error.message} onRetry={() => void runCompare()} /> : null}

      {hasComparison && comparisonData ? (
        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <CompareCurvesPlot series={comparisonData.curves} />
            </div>
            <div className="xl:col-span-4">
              <CompareRadarChart series={comparisonData.radar} />
            </div>
          </div>
          <ParamCompareTable items={comparisonData.params} />
        </section>
      ) : (
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-slate-300">
          Select one or more runs from the registry and click Compare to render ROC/PR curves, radar polygons, and parameter matrix.
        </section>
      )}
    </div>
  );

  return <WorkflowGuard requiredStep="upload a dataset">{content}</WorkflowGuard>;
}
