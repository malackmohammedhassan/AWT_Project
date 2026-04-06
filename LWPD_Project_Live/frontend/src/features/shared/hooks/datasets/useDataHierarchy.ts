import { useQuery } from "@tanstack/react-query";
import { useGlobalFilter } from "../../../../contexts/GlobalFilterContext";
import { datasetsService } from "../../../../api/datasetsService";

export function useDataHierarchy() {
  const { monthFilter } = useGlobalFilter();

  return useQuery({
    queryKey: ["datasets-hierarchy", monthFilter],
    queryFn: () => datasetsService.getHierarchy(monthFilter),
  });
}
