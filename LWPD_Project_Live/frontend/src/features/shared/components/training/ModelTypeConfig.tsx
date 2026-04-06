import { memo } from "react";
import type { ModelType } from "../../api/trainingTypes";

type ModelTypeConfigProps = {
  modelType: ModelType;
  onChange: (value: ModelType) => void;
};

function ModelTypeConfigComponent({ modelType, onChange }: ModelTypeConfigProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-2xl font-medium text-slate-100">Model type</h3>
      <select
        value={modelType}
        onChange={(event) => onChange(event.target.value as ModelType)}
        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-emerald-400/60 focus:ring-2"
      >
        <option value="logistic-regression">Logistic Regression</option>
        <option value="decision-tree">Decision Tree</option>
        <option value="naive-bayes">Naive Bayes</option>
      </select>
    </section>
  );
}

export const ModelTypeConfig = memo(ModelTypeConfigComponent);
