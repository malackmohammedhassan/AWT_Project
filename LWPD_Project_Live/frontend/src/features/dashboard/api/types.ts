import type { GlobalMonthFilter } from "../../../contexts/GlobalFilterContext";

export type DashboardQueryInput = {
  monthFilter: GlobalMonthFilter;
};

export type KpiSummary = {
  activePipelines: number;
  modelsTrained: number;
  deployedModels: number;
};

export type PipelineStageStatus = "optimal" | "warning" | "error";

export type PipelineFlowStage = {
  id: string;
  name: string;
  status: PipelineStageStatus;
  step: string;
};

export type TimeSeriesPoint = {
  timestamp: string;
  executionMs: number;
  throughput: number;
};

export type PieDistributionDatum = {
  label: string;
  value: number;
};

export type MailChartsPayload = {
  activeErrorDistribution: PieDistributionDatum[];
  mairDistribution: PieDistributionDatum[];
};

export type ActivityFeedItem = {
  timestamp: string;
  modelName: string;
  status: "success" | "failure";
};

export type ActivityFeedQueryInput = DashboardQueryInput & {
  page: number;
  pageSize: number;
};

export type PaginatedActivityFeed = {
  page: number;
  pageSize: number;
  total: number;
  items: ActivityFeedItem[];
};

export type ExecutionTimePoint = {
  timestamp: string;
  executionMs: number;
  executionTargetMs: number;
  throughput: number;
  throughputTarget: number;
};
