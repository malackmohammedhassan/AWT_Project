import { useQuery } from "@tanstack/react-query";
import { datasetsService } from "../../../../api/datasetsService";
import { useGlobalFilter } from "../../../../contexts/GlobalFilterContext";

export function useDatasetStats(datasetId: string) {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["dataset-stats", datasetId, monthFilter],
    queryFn: () => datasetsService.getDatasetStats({ datasetId, monthFilter }),
    enabled: Boolean(datasetId),
  });
}
