import { useQuery } from "@tanstack/react-query";
import { predictionService } from "../../../../api/predictionService";

export function usePredictionSamples() {
  return useQuery({
    queryKey: ["prediction-samples"],
    queryFn: () => predictionService.getPredictionSamples(),
  });
}
