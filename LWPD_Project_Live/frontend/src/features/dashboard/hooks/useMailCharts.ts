import { useQuery } from "@tanstack/react-query";
import { useGlobalFilter } from "../../../contexts/GlobalFilterContext";
import { dashboardService } from "../api/dashboardService";

export function useMailCharts() {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["mail-charts", monthFilter],
    queryFn: () => dashboardService.getMailCharts({ monthFilter }),
  });
}
