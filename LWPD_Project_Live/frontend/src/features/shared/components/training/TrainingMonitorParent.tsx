import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalFilter } from "../../../../contexts/GlobalFilterContext";
import { useGlobalNavigate } from "../../../../hooks/useGlobalNavigate";
import { experimentsService } from "../../../../api/experimentsService";
import { trainingService } from "../../../../api/trainingService";
import type { TrainingConfig } from "../../api/trainingTypes";
import { useLiveTrainingStream } from "../../hooks/training/useLiveTrainingStream";
import { useTrainingState } from "../../hooks/training/useTrainingState";
import { LiveConfusionMatrix } from "./LiveConfusionMatrix";
import { LiveEpochSummaryTable } from "./LiveEpochSummaryTable";
import { LiveLogConsole } from "./LiveLogConsole";
import { LiveTrainingCurves } from "./LiveTrainingCurves";
import { LiveValidationCurves } from "./LiveValidationCurves";
import { TrainingControls } from "./TrainingControls";

function modelTypeToDisplayName(modelType: TrainingConfig["modelType"]): string {
  if (modelType === "logistic-regression") {
    return "Logistic Regression";
  }
  if (modelType === "decision-tree") {
    return "Decision Tree";
  }
  return "Naive Bayes";
}

type TrainingMonitorParentProps = {
  config: TrainingConfig;
};

function TrainingMonitorParentComponent({ config }: TrainingMonitorParentProps) {
  const { monthFilter } = useGlobalFilter();
  const { toExperiments } = useGlobalNavigate();
  const { status, setStatus } = useTrainingState();
  const [runId, setRunId] = useState<string | null>(null);
  const [savedExperimentRunId, setSavedExperimentRunId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onCompleted = useCallback(() => {
    setStatus("COMPLETED");
    if (runId) {
      experimentsService.registerExternalRun({
        id: runId,
        modelId: config.modelType,
        modelName: modelTypeToDisplayName(config.modelType),
        datasetName: "Training Workspace",
        accuracy: 0.93,
      });
    }
  }, [config.modelType, runId, setStatus]);

  const { snapshot, liveProgress, resetWithConfig } = useLiveTrainingStream({
    status,
    config,
    monthFilter,
    onCompleted,
  });

  const startTraining = useCallback(async () => {
    try {
      setErrorMessage(null);
      setStatus("CONFIGURING");
      const response = await trainingService.startTraining(config);
      setRunId(response.runId);
      resetWithConfig(response.config);
      setStatus("TRAINING");
    } catch (error) {
      setStatus("FAILED");
      setErrorMessage(error instanceof Error ? error.message : "Unable to start training.");
    }
  }, [config, monthFilter, resetWithConfig, setStatus]);

  const stopTraining = useCallback(() => {
    if (status === "TRAINING") {
      setStatus("FAILED");
      setErrorMessage("Training stopped by user.");
    }
  }, [setStatus, status]);

  const saveTraining = useCallback(async () => {
    if (!runId) {
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      const response = await trainingService.saveModel(runId, config.modelType);
      setSavedExperimentRunId(response.experimentRunId);
      toExperiments(response.experimentRunId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save model.");
    } finally {
      setSaving(false);
    }
  }, [config.modelType, runId, toExperiments]);

  useEffect(() => {
    if (status === "TRAINING") {
      resetWithConfig(config);
    }
  }, [monthFilter, config, status, resetWithConfig]);

  const latestStatusHint = useMemo(() => {
    if (status === "TRAINING") {
      return "Streaming metrics in real-time...";
    }
    if (status === "COMPLETED") {
      return "Training completed. Save model to persist artifacts.";
    }
    if (status === "FAILED") {
      return errorMessage ?? "Run failed.";
    }
    if (status === "CONFIGURING") {
      return "Preparing training configuration...";
    }
    return "Ready to start a new training run.";
  }, [status, errorMessage]);

  return (
    <section className="space-y-4">
      <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
        <h3 className="text-2xl font-medium text-slate-100">Live Training Monitor.</h3>
        <p className="mt-1 text-sm text-slate-400">{latestStatusHint}</p>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <LiveTrainingCurves
            points={snapshot.points}
            onLossClick={() => {
              if (status === "COMPLETED") {
                toExperiments(savedExperimentRunId ?? runId ?? undefined);
              }
            }}
            lossClickable={status === "COMPLETED"}
          />
        </div>
        <div className="xl:col-span-6">
          <LiveValidationCurves points={snapshot.points} />
        </div>

        <div className="xl:col-span-6">
          <LiveEpochSummaryTable rows={snapshot.epochRows} />
        </div>
        <div className="xl:col-span-6">
          <LiveConfusionMatrix labels={snapshot.labels} matrix={snapshot.confusionMatrix} />
        </div>

        <div className="xl:col-span-4">
          <LiveLogConsole lines={snapshot.logs} />
        </div>
        <div className="xl:col-span-8">
          <TrainingControls
            status={status}
            progressPercent={liveProgress}
            onStart={() => {
              void startTraining();
            }}
            onStop={stopTraining}
            onSave={() => {
              void saveTraining();
            }}
            saving={saving}
          />
        </div>
      </div>
    </section>
  );
}

export const TrainingMonitorParent = memo(TrainingMonitorParentComponent);
