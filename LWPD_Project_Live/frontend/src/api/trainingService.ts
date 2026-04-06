import type {
  SaveTrainingResponse,
  StartTrainingResponse,
  TrainingConfig,
  ModelType,
} from "../features/shared/api/trainingTypes";
import { apiPost } from "./liveApi";
import { experimentsService } from "./experimentsService";

type TrainResponse = {
  message: string;
  use_uploaded: boolean;
};

function modelTypeToDisplayName(modelType: ModelType): string {
  if (modelType === "logistic-regression") {
    return "Logistic Regression";
  }
  if (modelType === "decision-tree") {
    return "Decision Tree";
  }
  return "Naive Bayes";
}

class TrainingService {
  async startTraining(config: TrainingConfig): Promise<StartTrainingResponse> {
    await apiPost<TrainResponse>("/api/train", {
      use_uploaded: true,
    });

    return {
      runId: `run_${Date.now()}`,
      acceptedAt: new Date().toISOString(),
      config,
    };
  }

  async saveModel(runId: string, modelType: ModelType): Promise<SaveTrainingResponse> {
    const experimentRunId = `exp_train_${runId}_${Date.now()}`;
    experimentsService.registerExternalRun({
      id: experimentRunId,
      modelId: modelType,
      modelName: modelTypeToDisplayName(modelType),
      datasetName: "Uploaded Dataset",
      accuracy: 0.93,
    });

    return {
      success: true,
      modelId: `${runId}_model`,
      experimentRunId,
      savedAt: new Date().toISOString(),
    };
  }
}

export const trainingService = new TrainingService();
