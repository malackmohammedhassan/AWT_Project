import { useQuery } from "@tanstack/react-query";
import { datasetsService } from "../../../../api/datasetsService";
import { useGlobalFilter } from "../../../../contexts/GlobalFilterContext";

export function useDatasetSummary(datasetId: string) {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["dataset-summary", datasetId, monthFilter],
    queryFn: () => datasetsService.getDatasetSummary({ datasetId, monthFilter }),
    enabled: Boolean(datasetId),
  });
}
