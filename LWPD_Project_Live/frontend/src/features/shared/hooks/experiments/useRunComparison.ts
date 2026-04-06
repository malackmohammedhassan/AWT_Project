import { useMutation } from "@tanstack/react-query";
import { experimentsService } from "../../../../api/experimentsService";
import { useGlobalFilter } from "../../../../contexts/GlobalFilterContext";

export function useRunComparison() {
  const { monthFilter } = useGlobalFilter();

  return useMutation({
    mutationKey: ["run-comparison", monthFilter],
    mutationFn: (runIds: string[]) => experimentsService.getRunComparison({ runIds, monthFilter }),
  });
}
