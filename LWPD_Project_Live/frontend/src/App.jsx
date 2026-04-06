import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

async function parseJson(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data;
}

function downloadCanvas(chartRef, fileName) {
  const chart = chartRef?.current;
  if (!chart) {
    return;
  }
  const url = chart.toBase64Image("image/png", 1);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
}

function formatPercent(value) {
  if (typeof value !== "number") {
    return "--";
  }
  return `${(value * 100).toFixed(2)}%`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "--";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

function extractProgress(logs) {
  const text = logs.map((item) => item.message).join("\n").toLowerCase();
  const steps = [
    {
      label: "Dataset Ready",
      done:
        text.includes("dataset uploaded") ||
        text.includes("loading dataset from primary") ||
        text.includes("loading uploaded dataset"),
    },
    {
      label: "Feature Build + Split",
      done: text.includes("feature matrix") || text.includes("train/test split"),
    },
    {
      label: "Model Training",
      done: text.includes("training logistic regression"),
    },
    {
      label: "Model Evaluation",
      done: text.includes("evaluating logistic regression") || text.includes("evaluating decision tree"),
    },
    {
      label: "Graph Export",
      done: text.includes("saving model accuracy comparison graph"),
    },
    {
      label: "Completed",
      done: text.includes("training job completed successfully"),
    },
  ];
  return steps;
}

export default function App() {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState({
    training: false,
    training_error: null,
    training_started_at: null,
    training_finished_at: null,
    metrics: [],
  });
  const [logs, setLogs] = useState([]);
  const [predictUrl, setPredictUrl] = useState("");
  const [predictResult, setPredictResult] = useState(null);
  const [error, setError] = useState("");
  const [graphs, setGraphs] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("lwpd-theme") || "light");
  const [clockMs, setClockMs] = useState(Date.now());

  const logsCursorRef = useRef(0);
  const accuracyChartRef = useRef(null);
  const precisionRecallChartRef = useRef(null);
  const classDistributionChartRef = useRef(null);

  const metrics = status.metrics || [];
  const labels = useMemo(() => metrics.map((item) => item.model), [metrics]);
  const accuracies = useMemo(() => metrics.map((item) => item.accuracy), [metrics]);
  const precisions = useMemo(() => metrics.map((item) => item.precision), [metrics]);
  const recalls = useMemo(() => metrics.map((item) => item.recall), [metrics]);

  const bestModel = useMemo(() => {
    if (metrics.length === 0) {
      return null;
    }
    return [...metrics].sort((a, b) => b.accuracy - a.accuracy)[0];
  }, [metrics]);

  const classDistribution = useMemo(() => {
    const dist = summary?.class_distribution || {};
    const label0 = Number(dist["0"] || 0);
    const label1 = Number(dist["1"] || 0);
    return [label0, label1];
  }, [summary]);
  const hasClassDistributionData = useMemo(
    () => classDistribution[0] + classDistribution[1] > 0,
    [classDistribution],
  );

  const progressSteps = useMemo(() => extractProgress(logs), [logs]);
  const completedSteps = useMemo(
    () => progressSteps.filter((step) => step.done).length,
    [progressSteps],
  );
  const totalSteps = progressSteps.length;

  const trainingProgressPercent = useMemo(() => {
    if (status.training_error) {
      return 0;
    }
    if (status.training === false && metrics.length > 0) {
      return 100;
    }
    return Math.round((completedSteps / totalSteps) * 100);
  }, [completedSteps, totalSteps, status.training, status.training_error, metrics.length]);

  const trainingEtaSeconds = useMemo(() => {
    if (!status.training || !status.training_started_at) {
      return null;
    }

    const elapsed = Math.max(1, (clockMs / 1000) - status.training_started_at);
    const done = Math.max(1, completedSteps);
    const remaining = Math.max(0, totalSteps - completedSteps);
    const eta = (elapsed / done) * remaining;
    return eta;
  }, [status.training, status.training_started_at, clockMs, completedSteps, totalSteps]);

  const datasetHealth = useMemo(() => {
    const rows = Number(summary?.rows || 0);
    const cols = Array.isArray(summary?.columns) ? summary.columns : [];
    const expectedColumns = cols.includes("url") && cols.includes("label");
    const legit = classDistribution[0] || 0;
    const phishing = classDistribution[1] || 0;
    const total = legit + phishing;
    const balanceRatio = total > 0 ? Math.min(legit, phishing) / Math.max(legit, phishing) : 0;
    const balanced = balanceRatio >= 0.6;

    return {
      rows,
      expectedColumns,
      balanced,
      balanceRatio,
      hasEnoughRows: rows >= 200,
      checksPassed:
        Number(expectedColumns) +
        Number(balanced) +
        Number(rows >= 200),
    };
  }, [summary, classDistribution]);

  const accuracyChartData = {
    labels,
    datasets: [
      {
        label: "Accuracy",
        data: accuracies,
        backgroundColor: ["#5b9ef5", "#ff9f5a", "#4ade80"],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const precisionRecallData = {
    labels,
    datasets: [
      {
        label: "Precision",
        data: precisions,
        backgroundColor: "#5b9ef5",
      },
      {
        label: "Recall",
        data: recalls,
        backgroundColor: "#4ade80",
      },
    ],
  };

  const trendData = {
    labels,
    datasets: [
      {
        label: "Accuracy Trend",
        data: accuracies,
        borderColor: "#5b9ef5",
        backgroundColor: "rgba(91,158,245,0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#5b9ef5",
        pointBorderColor: "#5b9ef5",
      },
    ],
  };

  const classDistributionData = {
    labels: ["Legit (0)", "Phishing (1)"],
    datasets: [
      {
        data: classDistribution,
        backgroundColor: ["#5b9ef5", "#ff9f5a"],
      },
    ],
  };

  async function refreshStatus() {
    try {
      const data = await parseJson(await fetch("/api/status"));
      setStatus(data);
      if (data.dataset_summary && Object.keys(data.dataset_summary).length > 0) {
        setSummary(data.dataset_summary);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function refreshLogs() {
    try {
      const data = await parseJson(await fetch(`/api/logs?after=${logsCursorRef.current}`));
      if (Array.isArray(data.items) && data.items.length > 0) {
        setLogs((prev) => [...prev, ...data.items]);
      }
      logsCursorRef.current = data.last_id;
    } catch (err) {
      setError(err.message);
    }
  }

  async function refreshGraphs() {
    try {
      const data = await parseJson(await fetch("/api/graphs"));
      setGraphs(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lwpd-theme", theme);
  }, [theme]);

  useEffect(() => {
    refreshStatus();
    refreshLogs();
    refreshGraphs();

    const interval = setInterval(() => {
      setClockMs(Date.now());
      refreshStatus();
      refreshLogs();
      refreshGraphs();
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  async function exportPdfReport() {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    let y = 40;

    doc.setFontSize(18);
    doc.text("LWPD Live Report", 40, y);
    y += 22;

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, y);
    y += 16;
    doc.text(`Dataset Rows: ${summary?.rows ?? "--"}`, 40, y);
    y += 16;
    doc.text(`Dataset Columns: ${(summary?.columns || []).join(", ") || "--"}`, 40, y);
    y += 16;
    doc.text(`Class Distribution: Legit=${classDistribution[0]} | Phishing=${classDistribution[1]}`, 40, y);
    y += 24;

    const metricRows = metrics.map((item) => [
      item.model,
      formatPercent(item.accuracy),
      formatPercent(item.precision),
      formatPercent(item.recall),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Model", "Accuracy", "Precision", "Recall"]],
      body: metricRows.length > 0 ? metricRows : [["No trained models", "--", "--", "--"]],
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [13, 112, 208],
      },
    });

    const tableEndY = doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 120;
    doc.setFontSize(11);
    doc.text(
      `Training Progress Snapshot: ${trainingProgressPercent}%`,
      40,
      tableEndY + 20,
    );
    doc.text(
      `Best Model: ${bestModel ? bestModel.model : "--"}`,
      40,
      tableEndY + 36,
    );

    doc.save(`lwpd_live_report_${Date.now()}.pdf`);
  }

  async function handleUpload(event) {
    event.preventDefault();
    setError("");

    const fileInput = event.target.elements.dataset;
    if (!fileInput.files || fileInput.files.length === 0) {
      setError("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const data = await parseJson(
        await fetch("/api/upload", {
          method: "POST",
          body: formData,
        }),
      );
      setSummary(data.summary);
      await refreshStatus();
    } catch (err) {
      setError(err.message);
    }
  }

  async function startTraining(useUploaded) {
    setError("");
    try {
      await parseJson(
        await fetch("/api/train", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ use_uploaded: useUploaded }),
        }),
      );
      await refreshStatus();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePredict(event) {
    event.preventDefault();
    setError("");
    setPredictResult(null);

    try {
      const data = await parseJson(
        await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: predictUrl }),
        }),
      );
      setPredictResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">LWPD Live Control Center</p>
          <h1>Phishing Detection Journey Dashboard</h1>
          <p className="subtext">Upload datasets, train models live, inspect metrics visually, predict URLs, and download every artifact.</p>
        </div>
        <div className="hero-actions">
          <span className={`status-chip ${status.training ? "running" : status.training_error ? "failed" : "idle"}`}>
            {status.training ? "Training Running" : status.training_error ? "Training Failed" : "Ready"}
          </span>
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              exportPdfReport().catch((err) => setError(err.message || "Unable to export PDF"));
            }}
          >
            Export PDF Report
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
          >
            {theme === "light" ? "Switch to Dark" : "Switch to Light"}
          </button>
        </div>
      </header>

      {error ? <div className="error-box">{error}</div> : null}

      <section className="top-grid">
        <article className="card">
          <div className="section-head">
            <h2>Dataset Intake</h2>
          </div>
          <form onSubmit={handleUpload} className="stack-form">
            <input type="file" name="dataset" accept=".csv" />
            <button type="submit">Upload Dataset</button>
          </form>

          <div className="stat-grid">
            <div className="stat-card">
              <span>Rows</span>
              <strong>{summary?.rows ?? "--"}</strong>
            </div>
            <div className="stat-card">
              <span>Columns Used</span>
              <strong>{summary?.columns?.length ?? "--"}</strong>
            </div>
            <div className="stat-card wide">
              <span>Source File</span>
              <strong>{summary?.filename ?? "No file uploaded"}</strong>
            </div>
          </div>

          <div className="health-panel">
            <h3>Dataset Health Checks</h3>
            <div className="health-list">
              <div className={`health-item ${datasetHealth.hasEnoughRows ? "pass" : "warn"}`}>
                <span>Row Volume &gt;= 200</span>
                <strong>{datasetHealth.hasEnoughRows ? "Pass" : "Low"}</strong>
              </div>
              <div className={`health-item ${datasetHealth.expectedColumns ? "pass" : "warn"}`}>
                <span>Required Columns (url, label)</span>
                <strong>{datasetHealth.expectedColumns ? "Pass" : "Missing"}</strong>
              </div>
              <div className={`health-item ${datasetHealth.balanced ? "pass" : "warn"}`}>
                <span>Class Balance</span>
                <strong>{datasetHealth.balanced ? "Balanced" : "Imbalanced"}</strong>
              </div>
            </div>
            <p className="muted">
              Health Score: {datasetHealth.checksPassed}/3 | Balance Ratio: {datasetHealth.balanceRatio.toFixed(2)}
            </p>
          </div>

          <div className="chart-container small">
            {summary && hasClassDistributionData ? (
              <>
                <div className="chart-head">
                  <h3>Class Distribution</h3>
                  <button type="button" onClick={() => downloadCanvas(classDistributionChartRef, "dataset_class_distribution.png")}>Download</button>
                </div>
                <Doughnut
                  ref={classDistributionChartRef}
                  data={classDistributionData}
                  options={{
                    plugins: { legend: { position: "bottom" } },
                    maintainAspectRatio: false,
                  }}
                />
              </>
            ) : (
              <p className="muted">Upload a dataset to unlock summary charts.</p>
            )}
          </div>
        </article>

        <article className="card">
          <div className="section-head">
            <h2>Live Training</h2>
          </div>

          <div className="button-cluster">
            <button type="button" onClick={() => startTraining(true)}>Train Uploaded Dataset</button>
            <button type="button" className="secondary" onClick={() => startTraining(false)}>Train Primary Dataset</button>
          </div>

          <div className="training-progress-wrap">
            <div className="training-progress-head">
              <span>Pipeline Progress</span>
              <strong>{trainingProgressPercent}%</strong>
            </div>
            <div className="training-progress-track">
              <div className="training-progress-fill" style={{ width: `${trainingProgressPercent}%` }} />
            </div>
            <p className="muted">
              {status.training
                ? `Estimated remaining time: ${formatDuration(trainingEtaSeconds)}`
                : status.training_finished_at
                  ? "Last training run finished"
                  : "Start a training run to see ETA"}
            </p>
          </div>

          <div className="progress-list">
            {progressSteps.map((step) => (
              <div className={`progress-step ${step.done ? "done" : "pending"}`} key={step.label}>
                <span className="dot" />
                <span>{step.label}</span>
              </div>
            ))}
          </div>

          <p className="muted">Training mode: {status.training ? "Active" : "Idle"}</p>
        </article>

        <article className="card">
          <div className="section-head">
            <h2>URL Prediction</h2>
          </div>

          <form onSubmit={handlePredict} className="stack-form">
            <input
              type="text"
              placeholder="https://example.com/login"
              value={predictUrl}
              onChange={(event) => setPredictUrl(event.target.value)}
            />
            <button type="submit">Predict URL</button>
          </form>

          {predictResult ? (
            <div className="prediction-panel">
              <div className={`result-banner ${predictResult.final_prediction === 1 ? "phish" : "legit"}`}>
                Final: {predictResult.final_label}
              </div>
              <div className="model-votes">
                {Object.entries(predictResult.models).map(([modelName, modelResult]) => (
                  <div className="vote" key={modelName}>
                    <span>{modelName}</span>
                    <strong>{modelResult.label}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="muted">Run training first, then submit a URL for live prediction.</p>
          )}
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Model Performance Overview</h2>
          <div className="inline-badges">
            <span className="pill">Models: {metrics.length || 0}</span>
            <span className="pill accent">
              Best: {bestModel ? `${bestModel.model} (${formatPercent(bestModel.accuracy)})` : "--"}
            </span>
          </div>
        </div>

        {metrics.length === 0 ? (
          <p className="muted">Train models to populate metrics and visualizations.</p>
        ) : (
          <div className="metrics-layout">
            <div className="metrics-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Accuracy</th>
                    <th>Precision</th>
                    <th>Recall</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((item) => (
                    <tr key={item.model}>
                      <td>{item.model}</td>
                      <td>{formatPercent(item.accuracy)}</td>
                      <td>{formatPercent(item.precision)}</td>
                      <td>{formatPercent(item.recall)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mini-chart-grid">
              <div className="chart-container">
                <div className="chart-head">
                  <h3>Accuracy by Model</h3>
                  <button type="button" onClick={() => downloadCanvas(accuracyChartRef, "accuracy_chart.png")}>Download</button>
                </div>
                <Bar
                  ref={accuracyChartRef}
                  data={accuracyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 0, max: 1 } },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>

              <div className="chart-container">
                <div className="chart-head">
                  <h3>Precision vs Recall</h3>
                  <button type="button" onClick={() => downloadCanvas(precisionRecallChartRef, "precision_recall_chart.png")}>Download</button>
                </div>
                <Bar
                  ref={precisionRecallChartRef}
                  data={precisionRecallData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 0, max: 1 } },
                  }}
                />
              </div>

              <div className="chart-container trend">
                <div className="chart-head">
                  <h3>Accuracy Trend</h3>
                </div>
                <Line
                  data={trendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 0, max: 1 } },
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Confusion Matrix Gallery</h2>
        </div>

        {metrics.length === 0 ? (
          <p className="muted">Confusion matrices appear here after training.</p>
        ) : (
          <div className="matrix-grid">
            {metrics.map((item) => (
              <article className="matrix-card" key={item.model}>
                <h3>{item.model}</h3>
                <img src={item.confusion_matrix_graph} alt={`${item.model} confusion matrix`} />
                <a href={item.confusion_matrix_graph} download>
                  Download Matrix
                </a>
              </article>
            ))}
          </div>
        )}

        {graphs.length > 0 ? (
          <div className="downloads-panel">
            <h3>All Generated Graphs</h3>
            <div className="downloads-grid">
              {graphs.map((graph) => (
                <a className="download-chip" href={graph.url} download key={graph.name}>
                  {graph.name}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Live Logs</h2>
        </div>
        <div className="log-stream">
          {logs.length === 0 ? (
            <div className="muted">No logs yet.</div>
          ) : (
            [...logs].reverse().map((log) => (
              <div className="log-line" key={log.id}>
                <span>{new Date(log.ts * 1000).toLocaleTimeString()}</span>
                <p>{log.message}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
