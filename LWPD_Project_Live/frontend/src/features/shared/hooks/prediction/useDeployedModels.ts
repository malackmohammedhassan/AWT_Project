import { useQuery } from "@tanstack/react-query";
import { predictionService } from "../../../../api/predictionService";

export function useDeployedModels() {
  return useQuery({
    queryKey: ["deployed-models"],
    queryFn: () => predictionService.getDeployedModels(),
  });
}
