import { useMutation } from "@tanstack/react-query";
import { predictionService } from "../../../../api/predictionService";

export function useUploadPredictionData() {
  return useMutation({
    mutationKey: ["predict-upload"],
    mutationFn: (fileName: string) => predictionService.uploadPredictData(fileName),
  });
}
