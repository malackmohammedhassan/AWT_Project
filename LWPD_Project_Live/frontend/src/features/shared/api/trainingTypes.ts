export type TrainingStatus = "IDLE" | "CONFIGURING" | "TRAINING" | "COMPLETED" | "FAILED";

export type ModelType = "logistic-regression" | "decision-tree" | "naive-bayes";

export type TrainingConfig = {
  modelType: ModelType;
  learningRate: number;
  epochs: number;
  batchSize: number;
  validationSplit: number;
  threshold: number;
};

export type StartTrainingResponse = {
  runId: string;
  acceptedAt: string;
  config: TrainingConfig;
};

export type SaveTrainingResponse = {
  success: true;
  modelId: string;
  experimentRunId: string;
  savedAt: string;
};

export type LiveMetricPoint = {
  epoch: number;
  trainingLoss: number;
  validationLoss: number;
  trainingAccuracy: number;
  validationAccuracy: number;
  learningRate: number;
};

export type EpochSummaryRow = {
  epoch: number;
  learningRate: number;
  loss: number;
  accuracy: number;
  validationAccuracy: number;
};

export type TrainingSnapshot = {
  points: LiveMetricPoint[];
  epochRows: EpochSummaryRow[];
  logs: string[];
  confusionMatrix: number[][];
  labels: string[];
};
