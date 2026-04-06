import { useQuery } from "@tanstack/react-query";
import { useGlobalFilter } from "../../../contexts/GlobalFilterContext";
import { dashboardService } from "../api/dashboardService";

export function useExecutionData() {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["execution-time", monthFilter],
    queryFn: () => dashboardService.getExecutionTimeSeries({ monthFilter }),
  });
}
