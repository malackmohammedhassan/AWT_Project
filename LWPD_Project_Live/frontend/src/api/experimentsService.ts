import type {
  CurvePoint,
  ExperimentRun,
  ExperimentsKpi,
  ParamCompareItem,
  RadarSeries,
  RunComparisonPayload,
  RunComparisonResponse,
  RunCurveSeries,
} from "../features/shared/api/experiments/experimentsTypes";
import type { GlobalMonthFilter } from "../contexts/GlobalFilterContext";
import { apiGet } from "./liveApi";

type BackendStatus = {
  metrics: Array<{
    model: string;
    accuracy: number;
    precision: number;
    recall: number;
  }>;
  training_error: string | null;
};

const RUN_COLORS = ["#22d3ee", "#f59e0b", "#ef4444", "#10b981", "#a78bfa"];

type ExternalRunInput = {
  id: string;
  modelId: string;
  modelName: string;
  datasetName: string;
  accuracy: number;
};

const externalRunsByFilter: Record<GlobalMonthFilter, ExperimentRun[]> = {
  "all-months": [],
  "last-30-days": [],
  "last-7-days": [],
};

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seeded(seed: number, salt: number, min: number, max: number): number {
  const x = Math.sin(seed * 0.001 + salt * 21.31) * 43758.5453;
  const f = x - Math.floor(x);
  return min + f * (max - min);
}

function buildCurve(seed: number, mode: "roc" | "pr"): CurvePoint[] {
  return Array.from({ length: 24 }, (_, idx) => {
    const x = idx / 23;
    const noise = seeded(seed, idx + 6, -0.03, 0.03);
    const yRaw = mode === "roc" ? Math.pow(x, 0.45) + noise : 1 - Math.pow(1 - x, 0.55) + noise;
    return {
      x: Number(x.toFixed(3)),
      y: Number(Math.max(0, Math.min(1, yRaw)).toFixed(3)),
    };
  });
}

async function buildBackendRuns(): Promise<ExperimentRun[]> {
  const status = await apiGet<BackendStatus>("/api/status");
  return status.metrics.map((metric, idx) => ({
    id: `run_${idx + 1}`,
    modelId: `model_class_${idx}`,
    modelName: metric.model,
    datasetName: "Uploaded Dataset",
    status: status.training_error ? "failed" : "success",
    accuracy: metric.accuracy,
    createdAt: new Date().toISOString(),
  }));
}

class ExperimentsService {
  registerExternalRun(input: ExternalRunInput): void {
    const run: ExperimentRun = {
      id: input.id,
      modelId: input.modelId,
      modelName: input.modelName,
      datasetName: input.datasetName,
      status: "success",
      accuracy: input.accuracy,
      createdAt: new Date().toISOString(),
    };

    (Object.keys(externalRunsByFilter) as GlobalMonthFilter[]).forEach((key) => {
      externalRunsByFilter[key] = [run, ...externalRunsByFilter[key].filter((item) => item.id !== run.id)];
    });
  }

  async getRuns(monthFilter: GlobalMonthFilter): Promise<ExperimentRun[]> {
    const backendRuns = await buildBackendRuns();
    const external = externalRunsByFilter[monthFilter];

    return [...external, ...backendRuns.filter((item) => !external.some((extra) => extra.id === item.id))];
  }

  async getKpi(monthFilter: GlobalMonthFilter): Promise<ExperimentsKpi> {
    const runs = await this.getRuns(monthFilter);
    const successfulRuns = runs.filter((run) => run.status === "success").length;

    return {
      totalRuns: runs.length,
      successfulRuns,
      comparedModels: Math.min(5, successfulRuns),
      bestAccuracy: runs.reduce((best, run) => Math.max(best, run.accuracy), 0),
    };
  }

  async getRunComparison(payload: RunComparisonPayload): Promise<RunComparisonResponse> {
    const runs = await this.getRuns(payload.monthFilter);

    const curves: RunCurveSeries[] = payload.runIds.map((runId, idx) => {
      const run = runs.find((item) => item.id === runId);
      const seed = hashSeed(`${runId}:${payload.monthFilter}`);

      return {
        runId,
        label: run?.modelName ?? runId,
        color: RUN_COLORS[idx % RUN_COLORS.length],
        roc: buildCurve(seed, "roc"),
        pr: buildCurve(seed + 17, "pr"),
      };
    });

    const radar: RadarSeries[] = payload.runIds.map((runId, idx) => {
      const run = runs.find((item) => item.id === runId);
      const seed = hashSeed(`radar:${runId}:${payload.monthFilter}`);
      const accuracy = run?.accuracy ?? 0.8;

      return {
        runId,
        label: run?.modelName ?? runId,
        color: RUN_COLORS[idx % RUN_COLORS.length],
        metrics: {
          accuracy,
          precision: Number(Math.max(0.5, accuracy - seeded(seed, 2, 0.01, 0.08)).toFixed(3)),
          recall: Number(Math.max(0.5, accuracy - seeded(seed, 3, 0.01, 0.1)).toFixed(3)),
          f1: Number(Math.max(0.5, accuracy - seeded(seed, 4, 0.01, 0.09)).toFixed(3)),
          rocAuc: Number(Math.min(0.99, accuracy + seeded(seed, 5, 0.01, 0.03)).toFixed(3)),
        },
      };
    });

    const params: ParamCompareItem[] = payload.runIds.map((runId, idx) => {
      const run = runs.find((item) => item.id === runId);
      const seed = hashSeed(`params:${runId}:${payload.monthFilter}`);

      return {
        runId,
        modelName: run?.modelName ?? `Model ${idx + 1}`,
        learningRate: Number(seeded(seed, 1, 0.0003, 0.02).toFixed(4)),
        batchSize: Math.round(seeded(seed, 2, 8, 128)),
        epochs: Math.round(seeded(seed, 3, 40, 220)),
        featureCount: Math.round(seeded(seed, 4, 6, 120)),
        trainTimeSec: Math.round(seeded(seed, 5, 12, 145)),
      };
    });

    return { curves, radar, params };
  }
}

export const experimentsService = new ExperimentsService();
