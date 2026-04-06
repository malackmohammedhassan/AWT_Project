import type {
  DatasetHeadResponse,
  DatasetHierarchyNode,
  DatasetQueryInput,
  DatasetStats,
  DatasetSummary,
  HistogramBin,
  HistogramMatrixCell,
  MatrixHeatmap,
} from "../features/shared/api/datasetsTypes";
import { apiGet } from "./liveApi";

type BackendStatus = {
  dataset_summary?: {
    filename?: string;
    rows?: number;
    columns?: string[];
    class_distribution?: Record<string, number>;
  };
  has_uploaded_dataset?: boolean;
};

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seeded(seed: number, salt: number, min: number, max: number): number {
  const x = Math.sin(seed * 0.001 + salt * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return min + frac * (max - min);
}

function buildMatrix(labels: string[], seed: number, min = -1, max = 1): MatrixHeatmap {
  const values: number[][] = labels.map((_, rowIdx) => {
    return labels.map((__, colIdx) => {
      if (rowIdx === colIdx) {
        return 1;
      }
      const base = seeded(seed, rowIdx * 37 + colIdx * 13, min, max);
      return Number(base.toFixed(2));
    });
  });

  return { labels, values };
}

function buildHistogramCells(seed: number, labels: string[], columns = 10): HistogramMatrixCell[] {
  return labels.map((label, idx) => {
    const bins: HistogramBin[] = Array.from({ length: columns }, (_, binIdx) => ({
      x: binIdx,
      y: Math.max(0, Math.round(seeded(seed + idx, binIdx + 1, 4, 120) - binIdx * 1.8)),
    }));
    return { label, bins };
  });
}

async function getBackendStatus(): Promise<BackendStatus> {
  try {
    return await apiGet<BackendStatus>("/api/status");
  } catch {
    return {};
  }
}

class DatasetsService {
  async getHierarchy(_monthFilter?: DatasetQueryInput["monthFilter"]): Promise<DatasetHierarchyNode[]> {
    const status = await getBackendStatus();
    const uploadedName = status.dataset_summary?.filename ?? "Uploaded Dataset";

    return [
      {
        id: "live-data",
        name: "Live Data",
        type: "folder",
        children: [
          { id: "uploaded_dataset", name: `${uploadedName} (Uploaded)`, type: "dataset" },
          { id: "primary_dataset", name: "Primary Dataset", type: "dataset" },
        ],
      },
    ];
  }

  async getDatasetSummary(input: DatasetQueryInput): Promise<DatasetSummary> {
    const status = await getBackendStatus();
    const summary = status.dataset_summary;

    if (input.datasetId === "uploaded_dataset" && summary) {
      const totalRows = Number(summary.rows ?? 0);
      const columns = summary.columns ?? [];
      const dist = summary.class_distribution ?? {};
      const uniqueValues = Object.values(dist).reduce((acc, value) => acc + Number(value), 0);

      return {
        totalRows,
        features: columns.length,
        missingDataPercent: 0,
        uniqueValues: Math.max(1, uniqueValues),
      };
    }

    return {
      totalRows: 0,
      features: 0,
      missingDataPercent: 0,
      uniqueValues: 0,
    };
  }

  async getDatasetHead(input: DatasetQueryInput): Promise<DatasetHeadResponse> {
    const status = await getBackendStatus();
    const summary = status.dataset_summary;

    const columns = (summary?.columns ?? []).map((name) => ({
      key: name,
      label: name,
      dataType: "text" as const,
    }));

    if (input.datasetId !== "uploaded_dataset" || columns.length === 0) {
      return {
        columns: [
          { key: "message", label: "Dataset", dataType: "text" as const },
          { key: "status", label: "Status", dataType: "text" as const },
        ],
        rows: [
          {
            message: "Upload a CSV dataset on Dashboard",
            status: "Waiting",
          },
        ],
      };
    }

    const rows = Array.from({ length: 12 }, (_, idx) => {
      const row: Record<string, string | number> = {};
      columns.forEach((col, colIdx) => {
        row[col.key] = `row_${idx + 1}_value_${colIdx + 1}`;
      });
      return row;
    });

    return {
      columns,
      rows,
    };
  }

  async getDatasetStats(input: DatasetQueryInput): Promise<DatasetStats> {
    const status = await getBackendStatus();
    const summary = status.dataset_summary;
    const labels = (summary?.columns ?? ["feature_1", "feature_2", "feature_3", "feature_4"]).slice(0, 8);

    const seed = hashSeed(`${input.datasetId}:${summary?.rows ?? 0}:${labels.join(",")}`);

    const correlation = buildMatrix(labels, seed, -0.2, 1);

    const histogramAll = buildHistogramCells(seed, labels.slice(0, 9));
    const histogramNumerical = buildHistogramCells(seed + 31, labels.slice(0, 9));

    const heatX = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const heatY = labels.slice(0, 6);
    const missingValueHeatmap = {
      labels: heatX,
      values: heatY.map((_, rowIdx) => {
        return heatX.map((__, colIdx) => Number(seeded(seed, rowIdx * 11 + colIdx * 7, 0, 1).toFixed(2)));
      }),
    };

    return {
      correlation,
      histogramAll,
      histogramNumerical,
      missingValueHeatmap,
    };
  }
}

export const datasetsService = new DatasetsService();
