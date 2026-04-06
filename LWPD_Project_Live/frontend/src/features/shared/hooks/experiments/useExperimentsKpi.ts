import { useQuery } from "@tanstack/react-query";
import { experimentsService } from "../../../../api/experimentsService";
import { useGlobalFilter } from "../../../../contexts/GlobalFilterContext";

export function useExperimentsKpi() {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["experiments-kpi", monthFilter],
    queryFn: () => experimentsService.getKpi(monthFilter),
  });
}
