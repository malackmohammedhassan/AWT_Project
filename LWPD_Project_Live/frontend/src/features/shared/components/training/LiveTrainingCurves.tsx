import { memo, useMemo } from "react";
import type { LiveMetricPoint } from "../../api/trainingTypes";
import { LiveLineChart } from "./LiveLineChart";

type LiveTrainingCurvesProps = {
  points: LiveMetricPoint[];
  onLossClick?: () => void;
  lossClickable?: boolean;
};

function LiveTrainingCurvesComponent({ points, onLossClick, lossClickable = false }: LiveTrainingCurvesProps) {
  const series = useMemo(
    () => [
      { key: "trainingLoss" as const, label: "Training set", color: "#60a5fa" },
      { key: "validationLoss" as const, label: "Validation set", color: "#f59e0b" },
    ],
    [],
  );

  return (
    <LiveLineChart
      title="Real-time Loss and Accuracy Curves"
      yLabel="Loss"
      points={points}
      series={series}
      yDomain={[0, 2]}
      onMetricClick={onLossClick}
      metricClickable={lossClickable}
    />
  );
}

export const LiveTrainingCurves = memo(LiveTrainingCurvesComponent);
