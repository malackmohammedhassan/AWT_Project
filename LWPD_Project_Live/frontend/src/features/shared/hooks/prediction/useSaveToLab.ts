import { useMutation } from "@tanstack/react-query";
import { predictionService } from "../../../../api/predictionService";
import type { SaveExperimentInput } from "../../api/prediction/predictionTypes";

export function useSaveToLab() {
  return useMutation({
    mutationKey: ["save-to-lab"],
    mutationFn: (payload: SaveExperimentInput) => predictionService.saveToExperimentLab(payload),
  });
}
