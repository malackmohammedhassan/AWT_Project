import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiGet } from "../../../../api/liveApi";
import type { GlobalMonthFilter } from "../../../../contexts/GlobalFilterContext";
import type {
  EpochSummaryRow,
  LiveMetricPoint,
  TrainingConfig,
  TrainingSnapshot,
  TrainingStatus,
} from "../../api/trainingTypes";

type UseLiveTrainingStreamInput = {
  status: TrainingStatus;
  config: TrainingConfig;
  monthFilter: GlobalMonthFilter;
  onCompleted: () => void;
};

type BackendMetric = {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  confusion_matrix: number[][];
};

type BackendStatus = {
  training: boolean;
  training_error: string | null;
  metrics: BackendMetric[];
};

type BackendLogs = {
  items: Array<{ id: number; ts: number; message: string }>;
  last_id: number;
};

const LABELS = ["Class 0", "Class 1"];

function buildRowsFromMetrics(metrics: BackendMetric[], learningRate: number): {
  points: LiveMetricPoint[];
  rows: EpochSummaryRow[];
} {
  const points: LiveMetricPoint[] = metrics.map((metric, idx) => {
    const loss = Number((1 - metric.accuracy).toFixed(4));
    const valLoss = Number((1 - (metric.precision + metric.recall) / 2).toFixed(4));
    const validationAccuracy = Number(((metric.precision + metric.recall) / 2).toFixed(4));

    return {
      epoch: idx + 1,
      trainingLoss: loss,
      validationLoss: valLoss,
      trainingAccuracy: Number(metric.accuracy.toFixed(4)),
      validationAccuracy,
      learningRate,
    };
  });

  const rows: EpochSummaryRow[] = points
    .slice()
    .reverse()
    .map((point) => ({
      epoch: point.epoch,
      learningRate,
      loss: point.trainingLoss,
      accuracy: point.trainingAccuracy,
      validationAccuracy: point.validationAccuracy,
    }));

  return { points, rows };
}

export function useLiveTrainingStream({
  status,
  config,
  onCompleted,
}: UseLiveTrainingStreamInput) {
  const [snapshot, setSnapshot] = useState<TrainingSnapshot>(() => ({
    points: [],
    epochRows: [],
    logs: ["Idle: configure model parameters and click Start Training."],
    confusionMatrix: [
      [0, 0],
      [0, 0],
    ],
    labels: LABELS,
  }));

  const lastLogIdRef = useRef(0);
  const completedRef = useRef(false);

  const resetWithConfig = useCallback((cfg: TrainingConfig) => {
    completedRef.current = false;
    lastLogIdRef.current = 0;

    setSnapshot({
      points: [],
      epochRows: [],
      logs: [
        `Run initialized: model=${cfg.modelType}, lr=${cfg.learningRate}, batch=${cfg.batchSize}`,
        "Waiting for backend training events...",
      ],
      confusionMatrix: [
        [0, 0],
        [0, 0],
      ],
      labels: LABELS,
    });
  }, []);

  useEffect(() => {
    if (status !== "TRAINING" && status !== "CONFIGURING") {
      return;
    }

    let disposed = false;

    const poll = async () => {
      try {
        const [backendStatus, logs] = await Promise.all([
          apiGet<BackendStatus>("/api/status"),
          apiGet<BackendLogs>(`/api/logs?after=${lastLogIdRef.current}`),
        ]);

        if (disposed) {
          return;
        }

        if (logs.items.length > 0) {
          lastLogIdRef.current = logs.last_id;
          setSnapshot((previous) => ({
            ...previous,
            logs: [
              ...previous.logs,
              ...logs.items.map((item) => `${new Date(item.ts * 1000).toLocaleTimeString()} | ${item.message}`),
            ].slice(-260),
          }));
        }

        if (backendStatus.metrics.length > 0) {
          const mapped = buildRowsFromMetrics(backendStatus.metrics, config.learningRate);
          setSnapshot((previous) => ({
            ...previous,
            points: mapped.points,
            epochRows: mapped.rows.slice(0, 12),
            confusionMatrix: backendStatus.metrics[0].confusion_matrix ?? previous.confusionMatrix,
          }));
        }

        if (!backendStatus.training && backendStatus.metrics.length > 0 && !completedRef.current) {
          completedRef.current = true;
          onCompleted();
        }
      } catch (error) {
        if (disposed) {
          return;
        }
        setSnapshot((previous) => ({
          ...previous,
          logs: [
            ...previous.logs,
            `Training monitor error: ${error instanceof Error ? error.message : "unknown error"}`,
          ].slice(-260),
        }));
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 1000);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [config.learningRate, onCompleted, status]);

  const liveProgress = useMemo(() => {
    if (snapshot.points.length === 0) {
      return status === "TRAINING" ? 10 : 0;
    }
    if (status === "COMPLETED") {
      return 100;
    }
    return Math.min(99, 30 + snapshot.points.length * 10);
  }, [snapshot.points.length, status]);

  return {
    snapshot,
    resetWithConfig,
    liveProgress,
  };
}
