import { useQuery } from "@tanstack/react-query";
import { useGlobalFilter } from "../../../contexts/GlobalFilterContext";
import { dashboardService } from "../api/dashboardService";

export function useKpiSummary() {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["kpi-summary", monthFilter],
    queryFn: () => dashboardService.getKpiSummary({ monthFilter }),
  });
}
