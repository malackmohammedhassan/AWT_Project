import { useCallback, useState } from "react";
import { WorkflowGuard } from "../../../components/common/WorkflowGuard";
import { HyperparameterForm } from "../components/training/HyperparameterForm";
import { ModelTypeConfig } from "../components/training/ModelTypeConfig";
import { TrainingMonitorParent } from "../components/training/TrainingMonitorParent";
import type { TrainingConfig } from "../api/trainingTypes";

const INITIAL_CONFIG: TrainingConfig = {
  modelType: "logistic-regression",
  learningRate: 0.0005,
  epochs: 120,
  batchSize: 16,
  validationSplit: 0.2,
  threshold: 0.5,
};

export function TrainingPage() {
  const [config, setConfig] = useState<TrainingConfig>(INITIAL_CONFIG);

  const handleModelTypeChange = useCallback((modelType: TrainingConfig["modelType"]) => {
    setConfig((previous) => ({ ...previous, modelType }));
  }, []);

  const handleConfigChange = useCallback((next: TrainingConfig) => {
    setConfig(next);
  }, []);

  const content = (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4 shadow-md">
        <h2 className="text-4xl font-semibold tracking-tight text-slate-100">Training & Testing & Live Visualisation</h2>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-3">
          <ModelTypeConfig modelType={config.modelType} onChange={handleModelTypeChange} />
          <HyperparameterForm config={config} onConfigChange={handleConfigChange} />
        </div>

        <div className="xl:col-span-9">
          <TrainingMonitorParent config={config} />
        </div>
      </section>
    </div>
  );

  return <WorkflowGuard requiredStep="upload a dataset">{content}</WorkflowGuard>;
}
