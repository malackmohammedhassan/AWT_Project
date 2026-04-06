import { apiGet } from "../../../api/liveApi";
import type {
  ActivityFeedQueryInput,
  ActivityFeedItem,
  DashboardQueryInput,
  ExecutionTimePoint,
  KpiSummary,
  MailChartsPayload,
  PaginatedActivityFeed,
  PipelineFlowStage,
} from "./types";

type BackendMetric = {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
};

type BackendStatus = {
  training: boolean;
  training_error: string | null;
  has_uploaded_dataset: boolean;
  has_trained_models: boolean;
  metrics: BackendMetric[];
};

type BackendLogResponse = {
  items: Array<{ id: number; ts: number; message: string }>;
  last_id: number;
};

async function getStatus(): Promise<BackendStatus> {
  return apiGet<BackendStatus>("/api/status");
}

async function getLogs(): Promise<BackendLogResponse> {
  return apiGet<BackendLogResponse>("/api/logs?after=0");
}

function safeAvg(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

class DashboardService {
  async getKpiSummary(_input: DashboardQueryInput): Promise<KpiSummary> {
    const status = await getStatus();
    return {
      activePipelines: status.training ? 1 : 0,
      modelsTrained: status.metrics.length,
      deployedModels: status.has_trained_models ? status.metrics.length : 0,
    };
  }

  async getPipelineFlow(_input: DashboardQueryInput): Promise<PipelineFlowStage[]> {
    const status = await getStatus();
    return [
      {
        id: "ingest",
        name: "Data Ingestion",
        status: status.has_uploaded_dataset ? "optimal" : "warning",
        step: status.has_uploaded_dataset ? "Uploaded dataset ready" : "Upload dataset required",
      },
      {
        id: "transform",
        name: "Transform",
        status: status.has_uploaded_dataset ? "optimal" : "warning",
        step: status.has_uploaded_dataset ? "Prepared" : "Waiting for upload",
      },
      {
        id: "train",
        name: "Train",
        status: status.training ? "warning" : status.has_trained_models ? "optimal" : "warning",
        step: status.training ? "Running" : status.has_trained_models ? "Completed" : "Not started",
      },
      {
        id: "deploy",
        name: "Deploy",
        status: status.has_trained_models ? "optimal" : "warning",
        step: status.has_trained_models ? "Models ready" : "Train first",
      },
      {
        id: "monitor",
        name: "Monitor",
        status: status.training_error ? "error" : status.training ? "warning" : "optimal",
        step: status.training_error ? "Error state" : status.training ? "In progress" : "Stable",
      },
    ];
  }

  async getExecutionTimeSeries(_input: DashboardQueryInput): Promise<ExecutionTimePoint[]> {
    const status = await getStatus();
    const logs = await getLogs();

    const avgAccuracy = safeAvg(status.metrics.map((metric) => metric.accuracy));
    const base = Math.max(1, logs.items.length);

    return Array.from({ length: 12 }, (_, idx) => {
      const timestamp = `${9 + idx}:00`;
      const executionMs = Math.round(380 + idx * 9 + (1 - avgAccuracy) * 220 + base * 0.4);
      const throughput = Math.max(4, Math.round((avgAccuracy * 60) + idx + base * 0.1));

      return {
        timestamp,
        executionMs,
        executionTargetMs: 500,
        throughput,
        throughputTarget: 42,
      };
    });
  }

  async getMailCharts(_input: DashboardQueryInput): Promise<MailChartsPayload> {
    const status = await getStatus();
    const successCount = status.metrics.length;
    const failedCount = status.training_error ? 1 : 0;
    const warningCount = status.training ? 1 : 0;

    return {
      activeErrorDistribution: [
        { label: "Optimal", value: Math.max(1, successCount) },
        { label: "Warning", value: warningCount },
        { label: "Error", value: failedCount },
      ],
      mairDistribution: [
        { label: "Upload", value: status.has_uploaded_dataset ? 1 : 0 },
        { label: "Train", value: status.training ? 1 : 0 },
        { label: "Models", value: successCount },
        { label: "Error", value: failedCount },
      ],
    };
  }

  async getActivityFeed(input: ActivityFeedQueryInput): Promise<PaginatedActivityFeed> {
    const logs = await getLogs();

    const items: ActivityFeedItem[] = logs.items
      .slice()
      .reverse()
      .map((entry, index) => {
        const msg = entry.message.toLowerCase();
        const status: ActivityFeedItem["status"] = msg.includes("failed") || msg.includes("error") ? "failure" : "success";
        return {
          timestamp: new Date(entry.ts * 1000).toISOString(),
          modelName: `Pipeline Event ${index + 1}`,
          status,
        };
      });

    const start = (input.page - 1) * input.pageSize;
    const pageItems = items.slice(start, start + input.pageSize);

    return {
      page: input.page,
      pageSize: input.pageSize,
      total: items.length,
      items: pageItems,
    };
  }
}

export const dashboardService = new DashboardService();
