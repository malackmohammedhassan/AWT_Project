import { useQuery } from "@tanstack/react-query";
import { useGlobalFilter } from "../../../contexts/GlobalFilterContext";
import { dashboardService } from "../api/dashboardService";

export function useActivityFeed(page: number, pageSize: number) {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["activity-feed", monthFilter, page, pageSize],
    queryFn: () => dashboardService.getActivityFeed({ monthFilter, page, pageSize }),
  });
}
