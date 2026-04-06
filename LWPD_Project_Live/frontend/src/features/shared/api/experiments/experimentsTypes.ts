import type { GlobalMonthFilter } from "../../../../contexts/GlobalFilterContext";

export type ExperimentRun = {
  id: string;
  modelId: string;
  modelName: string;
  datasetName: string;
  status: "success" | "failed";
  accuracy: number;
  createdAt: string;
};

export type ExperimentsKpi = {
  totalRuns: number;
  successfulRuns: number;
  comparedModels: number;
  bestAccuracy: number;
};

export type CurvePoint = {
  x: number;
  y: number;
};

export type RunCurveSeries = {
  runId: string;
  label: string;
  color: string;
  roc: CurvePoint[];
  pr: CurvePoint[];
};

export type RadarMetricKey = "accuracy" | "precision" | "recall" | "f1" | "rocAuc";

export type RadarSeries = {
  runId: string;
  label: string;
  color: string;
  metrics: Record<RadarMetricKey, number>;
};

export type ParamCompareItem = {
  runId: string;
  modelName: string;
  learningRate: number;
  batchSize: number;
  epochs: number;
  featureCount: number;
  trainTimeSec: number;
};

export type RunComparisonPayload = {
  runIds: string[];
  monthFilter: GlobalMonthFilter;
};

export type RunComparisonResponse = {
  curves: RunCurveSeries[];
  radar: RadarSeries[];
  params: ParamCompareItem[];
};
