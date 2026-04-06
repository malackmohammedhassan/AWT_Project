import { useQuery } from "@tanstack/react-query";
import { datasetsService } from "../../../../api/datasetsService";
import { useGlobalFilter } from "../../../../contexts/GlobalFilterContext";

export function useDatasetData(datasetId: string) {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["dataset-head", datasetId, monthFilter],
    queryFn: () => datasetsService.getDatasetHead({ datasetId, monthFilter }),
    enabled: Boolean(datasetId),
  });
}
