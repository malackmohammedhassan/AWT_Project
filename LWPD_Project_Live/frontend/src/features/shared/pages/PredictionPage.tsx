import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { WorkflowGuard } from "../../../components/common/WorkflowGuard";
import { useGlobalFilter } from "../../../contexts/GlobalFilterContext";
import { useGlobalNavigate } from "../../../hooks/useGlobalNavigate";
import { FeatureBreakdownTable } from "../components/prediction/FeatureBreakdownTable";
import { FeatureImportancePlot } from "../components/prediction/FeatureImportancePlot";
import { InferenceResultCard } from "../components/prediction/InferenceResultCard";
import { ModelSelector } from "../components/prediction/ModelSelector";
import { ParallelCoordinates } from "../components/prediction/ParallelCoordinates";
import { PredictionDataUpload } from "../components/prediction/PredictionDataUpload";
import { PredictionInputGrid } from "../components/prediction/PredictionInputGrid";
import { PredictionPanelError } from "../components/prediction/PredictionPanelError";
import { PredictionPanelSkeleton } from "../components/prediction/PredictionPanelSkeleton";
import { SaveToLabButton } from "../components/prediction/SaveToLabButton";
import { useDeployedModels } from "../hooks/prediction/useDeployedModels";
import { useInference } from "../hooks/prediction/useInference";
import { usePredictionSamples } from "../hooks/prediction/usePredictionSamples";
import { useSaveToLab } from "../hooks/prediction/useSaveToLab";

export function PredictionPage() {
  const { monthFilter } = useGlobalFilter();
  const { toExperiments } = useGlobalNavigate();
  const [searchParams] = useSearchParams();
  const modelsQuery = useDeployedModels();
  const samplesQuery = usePredictionSamples();
  const inference = useInference();
  const saveToLab = useSaveToLab();
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const models = modelsQuery.data ?? [];
  const samples = samplesQuery.data ?? [];
  const firstSampleId = samples[0]?.id ?? "";
  const firstModelId = models[0]?.id ?? "";

  const [activeSampleId, setActiveSampleId] = useState<string>("");
  const [activeModelId, setActiveModelId] = useState<string>("");
  const autorunRef = useRef<string | null>(null);

  const modelIdFromUrl = searchParams.get("modelId");
  const sampleIdFromUrl = searchParams.get("sampleId");
  const autoRunFromUrl = searchParams.get("autorun") === "1";

  useEffect(() => {
    if (!activeSampleId && firstSampleId) {
      setActiveSampleId(firstSampleId);
    }
  }, [activeSampleId, firstSampleId]);

  useEffect(() => {
    if (!activeModelId && firstModelId) {
      setActiveModelId(firstModelId);
    }
  }, [activeModelId, firstModelId]);

  useEffect(() => {
    if (modelIdFromUrl && models.some((model) => model.id === modelIdFromUrl) && modelIdFromUrl !== activeModelId) {
      setActiveModelId(modelIdFromUrl);
    }
  }, [modelIdFromUrl, models, activeModelId]);

  useEffect(() => {
    if (sampleIdFromUrl && samples.some((sample) => sample.id === sampleIdFromUrl) && sampleIdFromUrl !== activeSampleId) {
      setActiveSampleId(sampleIdFromUrl);
    }
  }, [sampleIdFromUrl, samples, activeSampleId]);

  useEffect(() => {
    inference.reset();
  }, [activeSampleId, activeModelId, monthFilter]);

  useEffect(() => {
    const signature = `${modelIdFromUrl ?? ""}|${sampleIdFromUrl ?? ""}|${monthFilter}`;
    if (!autoRunFromUrl || !activeModelId || !activeSampleId || inference.isPending) {
      return;
    }
    if (autorunRef.current === signature) {
      return;
    }
    autorunRef.current = signature;
    void inference.mutateAsync({
      sampleId: activeSampleId,
      modelId: activeModelId,
      monthFilter,
    });
  }, [autoRunFromUrl, modelIdFromUrl, sampleIdFromUrl, activeModelId, activeSampleId, monthFilter, inference]);

  const canRunInference = Boolean(activeSampleId && activeModelId && !inference.isPending);

  const headerHint = useMemo(() => {
    if (uploadedFile) {
      return `Uploaded source: ${uploadedFile}`;
    }
    return "Upload an input file or pick a sample, then run explainable inference.";
  }, [uploadedFile]);

  function handleModelChange(modelId: string) {
    setActiveModelId(modelId);
  }

  function handleSampleChange(sampleId: string) {
    setActiveSampleId(sampleId);
  }

  async function runPrediction() {
    if (!activeSampleId || !activeModelId) {
      return;
    }

    await inference.mutateAsync({
      sampleId: activeSampleId,
      modelId: activeModelId,
      monthFilter,
    });
  }

  async function savePrediction() {
    if (!inference.data || !activeSampleId || !activeModelId) {
      return;
    }

    const saveResult = await saveToLab.mutateAsync({
      sampleId: activeSampleId,
      modelId: activeModelId,
      result: inference.data,
    });
    toExperiments(saveResult.experimentId);
  }

  if (modelsQuery.isLoading || samplesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <PredictionPanelSkeleton titleWidthClass="w-72" heightClass="h-16" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <PredictionPanelSkeleton titleWidthClass="w-44" heightClass="h-56" />
          <PredictionPanelSkeleton titleWidthClass="w-44" heightClass="h-56" />
        </div>
      </div>
    );
  }

  if (modelsQuery.isError) {
    return <PredictionPanelError message={modelsQuery.error.message} onRetry={() => void modelsQuery.refetch()} />;
  }

  if (samplesQuery.isError) {
    return <PredictionPanelError message={samplesQuery.error.message} onRetry={() => void samplesQuery.refetch()} />;
  }

  const content = (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 shadow-md">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-100">Prediction & proper full Visualisation</h2>
        <p className="mt-1 text-sm text-slate-400">{headerHint}</p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <PredictionDataUpload onUploaded={setUploadedFile} />
        </div>
        <div className="xl:col-span-6">
          <PredictionInputGrid samples={samples} activeSampleId={activeSampleId} onSampleChange={handleSampleChange} />
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
        <label className="flex items-center gap-3 text-lg text-slate-300">
          <span>Select test sample:</span>
          <select
            value={activeSampleId}
            onChange={(event) => setActiveSampleId(event.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-base text-slate-100"
          >
            {samples.map((sample) => (
              <option key={sample.id} value={sample.id}>
                [{sample.label}]
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-3">
          <ModelSelector models={models} value={activeModelId} onChange={handleModelChange} />
          <button
            type="button"
            onClick={() => void runPrediction()}
            disabled={!canRunInference}
            className="rounded-lg border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-lg font-medium text-sky-100 disabled:opacity-40"
          >
            {inference.isPending ? "Running..." : "Run Prediction"}
          </button>
        </div>
      </section>

      {inference.isError ? <PredictionPanelError message={inference.error.message} onRetry={() => void runPrediction()} /> : null}

      {inference.data ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className="xl:col-span-3">
            <InferenceResultCard result={inference.data} />
          </div>
          <div className="space-y-4 xl:col-span-9">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <FeatureImportancePlot items={inference.data.featureImportance} />
              <ParallelCoordinates axes={inference.data.parallelAxes} lines={inference.data.parallelLines} />
            </div>

            <FeatureBreakdownTable items={inference.data.featureBreakdown} />
            <SaveToLabButton
              onClick={() => {
                void savePrediction();
              }}
              disabled={!inference.data}
              loading={saveToLab.isPending}
            />
            {saveToLab.isSuccess ? (
              <p className="text-sm text-emerald-300">Saved to Experiment Lab: {saveToLab.data.experimentId}</p>
            ) : null}
            {saveToLab.isError ? <PredictionPanelError message={saveToLab.error.message} /> : null}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-5 text-slate-300">
          Run prediction to populate Result, SHAP/LIME, Parallel Coordinates, and feature breakdown panels.
        </section>
      )}
    </div>
  );

  return <WorkflowGuard requiredStep="upload a dataset">{content}</WorkflowGuard>;
}
