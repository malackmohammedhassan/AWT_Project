import { memo } from "react";
import type { InferenceResult } from "../../api/prediction/predictionTypes";

type InferenceResultCardProps = {
  result: InferenceResult;
};

function InferenceResultCardComponent({ result }: InferenceResultCardProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-md">
      <h3 className="mb-6 text-2xl font-medium text-slate-100">Result</h3>
      <div className="space-y-8 text-center">
        <div>
          <p className="text-base text-slate-300">Predicted Class:</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">[{result.predictedClass}]</p>
        </div>
        <div>
          <p className="text-base text-slate-300">Confidence Score:</p>
          <p className="mt-2 text-3xl font-semibold text-slate-100">{(result.confidenceScore * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-base text-slate-300">Inference Time:</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{result.inferenceTimeMs}ms</p>
        </div>
      </div>
    </section>
  );
}

export const InferenceResultCard = memo(InferenceResultCardComponent);
