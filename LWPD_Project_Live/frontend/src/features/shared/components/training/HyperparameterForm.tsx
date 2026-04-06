import { memo } from "react";
import type { TrainingConfig } from "../../api/trainingTypes";

type HyperparameterFormProps = {
  config: TrainingConfig;
  onConfigChange: (next: TrainingConfig) => void;
};

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-emerald-400/60 focus:ring-2"
      />
    </label>
  );
}

function HyperparameterFormComponent({ config, onConfigChange }: HyperparameterFormProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-2xl font-medium text-slate-100">Hyperparameters</h3>
      <div className="grid gap-3">
        <Field
          label="Learning Rate"
          value={config.learningRate}
          min={0.00001}
          max={1}
          step={0.0001}
          onChange={(value) => onConfigChange({ ...config, learningRate: value })}
        />
        <Field
          label="Epochs"
          value={config.epochs}
          min={10}
          max={500}
          step={1}
          onChange={(value) => onConfigChange({ ...config, epochs: value })}
        />
        <Field
          label="Batch Size"
          value={config.batchSize}
          min={4}
          max={512}
          step={1}
          onChange={(value) => onConfigChange({ ...config, batchSize: value })}
        />
        <Field
          label="Validation Split"
          value={config.validationSplit}
          min={0.05}
          max={0.5}
          step={0.01}
          onChange={(value) => onConfigChange({ ...config, validationSplit: value })}
        />
        <Field
          label="Model Threshold"
          value={config.threshold}
          min={0.1}
          max={0.95}
          step={0.01}
          onChange={(value) => onConfigChange({ ...config, threshold: value })}
        />
      </div>
    </section>
  );
}

export const HyperparameterForm = memo(HyperparameterFormComponent);
