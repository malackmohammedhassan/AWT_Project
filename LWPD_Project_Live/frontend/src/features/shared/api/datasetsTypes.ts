import type { GlobalMonthFilter } from "../../../contexts/GlobalFilterContext";

export type DatasetQueryInput = {
  monthFilter: GlobalMonthFilter;
  datasetId: string;
};

export type DatasetHierarchyNode = {
  id: string;
  name: string;
  type: "folder" | "dataset";
  children?: DatasetHierarchyNode[];
};

export type DatasetSummary = {
  totalRows: number;
  features: number;
  missingDataPercent: number;
  uniqueValues: number;
};

export type DatasetColumn = {
  key: string;
  label: string;
  dataType: "text" | "number";
};

export type DatasetRow = Record<string, string | number>;

export type DatasetHeadResponse = {
  columns: DatasetColumn[];
  rows: DatasetRow[];
};

export type HistogramBin = {
  x: number;
  y: number;
};

export type MatrixHeatmap = {
  labels: string[];
  values: number[][];
};

export type HistogramMatrixCell = {
  label: string;
  bins: HistogramBin[];
};

export type DatasetStats = {
  correlation: MatrixHeatmap;
  histogramAll: HistogramMatrixCell[];
  histogramNumerical: HistogramMatrixCell[];
  missingValueHeatmap: MatrixHeatmap;
};
