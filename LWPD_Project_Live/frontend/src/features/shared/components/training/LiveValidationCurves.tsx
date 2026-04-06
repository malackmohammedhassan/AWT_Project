import { memo, useMemo } from "react";
import type { LiveMetricPoint } from "../../api/trainingTypes";
import { LiveLineChart } from "./LiveLineChart";

type LiveValidationCurvesProps = {
  points: LiveMetricPoint[];
};

function LiveValidationCurvesComponent({ points }: LiveValidationCurvesProps) {
  const series = useMemo(
    () => [
      { key: "trainingAccuracy" as const, label: "Training set", color: "#22c55e" },
      { key: "validationAccuracy" as const, label: "Validation set", color: "#f59e0b" },
    ],
    [],
  );

  return (
    <LiveLineChart
      title="Real-time Losss and Accuracy Curves"
      yLabel="Accuracy"
      points={points}
      series={series}
      yDomain={[0, 1]}
    />
  );
}

export const LiveValidationCurves = memo(LiveValidationCurvesComponent);
