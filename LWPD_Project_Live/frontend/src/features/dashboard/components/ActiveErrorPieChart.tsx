import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartPanelSkeleton } from "./ChartPanelSkeleton";
import { PanelErrorState } from "./PanelErrorState";
import "./chartSetup";
import { useMailCharts } from "../hooks/useMailCharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export function ActiveErrorPieChart() {
  const { data, isLoading, isError, error, refetch } = useMailCharts();

  const chartData = useMemo(() => {
    const source = data?.activeErrorDistribution ?? [];
    return {
      labels: source.map((item) => item.label),
      datasets: [
        {
          data: source.map((item) => item.value),
          backgroundColor: COLORS,
          borderColor: "#1f2937",
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right" as const,
          labels: {
            color: "#d1d5db",
          },
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#f3f4f6",
          bodyColor: "#e5e7eb",
          borderColor: "#334155",
          borderWidth: 1,
        },
      },
    }),
    [],
  );

  if (isLoading) {
    return <ChartPanelSkeleton titleWidthClass="w-40" bodyHeightClass="h-52" />;
  }

  if (isError) {
    return (
      <PanelErrorState
        title="Error Loading Data"
        message={error.message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-lg font-medium text-slate-100">Active / Warning / Error Distribution</h3>
      <div className="h-56">
        <Doughnut data={chartData} options={options} />
      </div>
    </section>
  );
}
