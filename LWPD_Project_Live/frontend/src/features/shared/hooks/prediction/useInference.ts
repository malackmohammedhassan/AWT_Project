import { useMutation } from "@tanstack/react-query";
import { predictionService } from "../../../../api/predictionService";
import type { RunInferenceInput } from "../../api/prediction/predictionTypes";

export function useInference() {
  return useMutation({
    mutationKey: ["run-inference"],
    mutationFn: (payload: RunInferenceInput) => predictionService.runInference(payload),
  });
}
