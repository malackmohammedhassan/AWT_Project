import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type UploadedDataset = {
  id: string;
  name: string;
  fileName: string;
  uploadedAt: Date;
  rowCount?: number;
  columnCount?: number;
  columns?: string[];
  classDistribution?: Record<string, number>;
};

type UploadDatasetContextValue = {
  uploadedDataset: UploadedDataset | null;
  setUploadedDataset: (dataset: UploadedDataset) => void;
  clearUploadedDataset: () => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  uploadError: string | null;
  setUploadError: (error: string | null) => void;
};

const UploadDatasetContext = createContext<UploadDatasetContextValue | null>(null);

export function UploadDatasetProvider({ children }: { children: ReactNode }) {
  const [uploadedDataset, setUploadedDataset] = useState<UploadedDataset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      uploadedDataset,
      setUploadedDataset,
      clearUploadedDataset: () => setUploadedDataset(null),
      isUploading,
      setIsUploading,
      uploadError,
      setUploadError,
    }),
    [uploadedDataset, isUploading, uploadError],
  );

  return (
    <UploadDatasetContext.Provider value={value}>{children}</UploadDatasetContext.Provider>
  );
}

export function useUploadDataset() {
  const context = useContext(UploadDatasetContext);
  if (!context) {
    throw new Error("useUploadDataset must be used within UploadDatasetProvider");
  }
  return context;
}
