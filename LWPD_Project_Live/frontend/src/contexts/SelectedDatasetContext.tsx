import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type SelectedDatasetContextValue = {
  selectedDatasetId: string;
  setSelectedDatasetId: (datasetId: string) => void;
};

const SelectedDatasetContext = createContext<SelectedDatasetContextValue | null>(null);

export function SelectedDatasetProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const datasetIdFromUrl = searchParams.get("datasetId") ?? "uploaded_dataset";
  const [selectedDatasetId, setSelectedDatasetIdState] = useState(datasetIdFromUrl);

  useEffect(() => {
    if (datasetIdFromUrl !== selectedDatasetId) {
      setSelectedDatasetIdState(datasetIdFromUrl);
    }
  }, [datasetIdFromUrl, selectedDatasetId]);

  const setSelectedDatasetId = useCallback(
    (datasetId: string) => {
      setSelectedDatasetIdState(datasetId);
      setSearchParams((previous) => {
        if (previous.get("datasetId") === datasetId) {
          return previous;
        }
        const next = new URLSearchParams(previous);
        next.set("datasetId", datasetId);
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const value = useMemo(
    () => ({
      selectedDatasetId,
      setSelectedDatasetId,
    }),
    [selectedDatasetId, setSelectedDatasetId],
  );

  return <SelectedDatasetContext.Provider value={value}>{children}</SelectedDatasetContext.Provider>;
}

export function useSelectedDataset() {
  const context = useContext(SelectedDatasetContext);
  if (!context) {
    throw new Error("useSelectedDataset must be used within SelectedDatasetProvider");
  }
  return context;
}
