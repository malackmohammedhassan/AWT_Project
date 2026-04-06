import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { ChartPanelSkeleton } from "./ChartPanelSkeleton";
import { PanelErrorState } from "./PanelErrorState";
import "./chartSetup";
import { useExecutionData } from "../hooks/useExecutionData";

export function ThroughputLineChart() {
  const { data, isLoading, isError, error, refetch } = useExecutionData();

  const chartData = useMemo(() => {
    const points = data ?? [];
    return {
      labels: points.map((point) => point.timestamp),
      datasets: [
        {
          label: "Throughput",
          data: points.map((point) => point.throughput),
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96, 165, 250, 0.12)",
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: "Target",
          data: points.map((point) => point.throughputTarget),
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.08)",
          fill: false,
          tension: 0.25,
          pointRadius: 2,
        },
      ],
    };
  }, [data]);

  const options = useMemo(
    () => ({
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148, 163, 184, 0.15)" },
        },
        y: {
          title: {
            display: true,
            text: "Throughput",
            color: "#9ca3af",
          },
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148, 163, 184, 0.15)" },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "#e5e7eb",
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
    return <ChartPanelSkeleton titleWidthClass="w-28" bodyHeightClass="h-72" />;
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
      <h3 className="mb-3 text-lg font-medium text-slate-100">Throughput</h3>
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
    </section>
  );
}
