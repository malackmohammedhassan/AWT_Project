import { memo } from "react";
import type { DeployedModel } from "../../api/prediction/predictionTypes";

type ModelSelectorProps = {
  models: DeployedModel[];
  value: string;
  onChange: (modelId: string) => void;
};

function ModelSelectorComponent({ models, value, onChange }: ModelSelectorProps) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-300">
      <span className="text-base font-medium text-slate-300">Trained model:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[280px] rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export const ModelSelector = memo(ModelSelectorComponent);
