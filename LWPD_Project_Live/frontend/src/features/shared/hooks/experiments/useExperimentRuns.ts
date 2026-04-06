import { useQuery } from "@tanstack/react-query";
import { experimentsService } from "../../../../api/experimentsService";
import { useGlobalFilter } from "../../../../contexts/GlobalFilterContext";

export function useExperimentRuns() {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["experiment-runs", monthFilter],
    queryFn: () => experimentsService.getRuns(monthFilter),
  });
}
