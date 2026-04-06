import type { GlobalMonthFilter } from "../../../../contexts/GlobalFilterContext";

export type DeployedModel = {
  id: string;
  name: string;
};

export type PredictionSample = {
  id: string;
  label: string;
  features: Record<string, number>;
};

export type UploadPredictionResponse = {
  uploadId: string;
  acceptedRows: number;
  filename: string;
};

export type FeatureImportanceItem = {
  feature: string;
  contribution: number;
};

export type ParallelAxis = {
  key: string;
  label: string;
  min: number;
  max: number;
};

export type ParallelLine = {
  id: string;
  values: Record<string, number>;
  highlight: boolean;
};

export type FeatureBreakdownItem = {
  feature: string;
  positiveScore: number;
  negativeScore: number;
  missingDataPercent: number;
  uniqueValues: number;
};

export type InferenceResult = {
  predictedClass: string;
  confidenceScore: number;
  inferenceTimeMs: number;
  featureImportance: FeatureImportanceItem[];
  parallelAxes: ParallelAxis[];
  parallelLines: ParallelLine[];
  featureBreakdown: FeatureBreakdownItem[];
};

export type RunInferenceInput = {
  sampleId: string;
  modelId: string;
  monthFilter: GlobalMonthFilter;
};

export type SaveExperimentInput = {
  sampleId: string;
  modelId: string;
  result: InferenceResult;
};

export type SaveExperimentResponse = {
  success: true;
  experimentId: string;
  savedAt: string;
};
