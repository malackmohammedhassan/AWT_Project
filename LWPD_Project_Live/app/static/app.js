let logsCursor = 0;
let accuracyChart = null;
let prChart = null;

const datasetSummary = document.getElementById("datasetSummary");
const trainingStatus = document.getElementById("trainingStatus");
const predictOutput = document.getElementById("predictOutput");
const logsEl = document.getElementById("logs");
const metricsTableWrap = document.getElementById("metricsTableWrap");
const cmGrid = document.getElementById("cmGrid");

function appendLog(message) {
  const line = document.createElement("div");
  line.textContent = message;
  logsEl.appendChild(line);
  logsEl.scrollTop = logsEl.scrollHeight;
}

async function refreshStatus() {
  const response = await fetch("/api/status");
  const data = await response.json();

  trainingStatus.textContent = data.training
    ? "Status: training in progress"
    : data.training_error
      ? `Status: failed (${data.training_error})`
      : "Status: idle";

  if (data.dataset_summary && data.dataset_summary.rows) {
    datasetSummary.textContent = JSON.stringify(data.dataset_summary, null, 2);
  }

  if (Array.isArray(data.metrics) && data.metrics.length > 0) {
    renderMetrics(data.metrics);
    renderConfusionMatrices(data.metrics);
    renderCharts(data.metrics);
  }
}

async function refreshLogs() {
  const response = await fetch(`/api/logs?after=${logsCursor}`);
  const data = await response.json();
  for (const item of data.items) {
    appendLog(`[${new Date(item.ts * 1000).toLocaleTimeString()}] ${item.message}`);
  }
  logsCursor = data.last_id;
}

function renderMetrics(metrics) {
  const rows = metrics
    .map((m) => {
      return `<tr><td>${m.model}</td><td>${m.accuracy.toFixed(4)}</td><td>${m.precision.toFixed(4)}</td><td>${m.recall.toFixed(4)}</td></tr>`;
    })
    .join("");

  metricsTableWrap.innerHTML = `
    <table>
      <thead>
        <tr><th>Model</th><th>Accuracy</th><th>Precision</th><th>Recall</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderConfusionMatrices(metrics) {
  cmGrid.innerHTML = metrics
    .map(
      (m) => `
      <article class="cm-card">
        <h3>${m.model}</h3>
        <img src="${m.confusion_matrix_graph}" alt="${m.model} confusion matrix" />
      </article>
    `,
    )
    .join("");
}

function renderCharts(metrics) {
  const labels = metrics.map((m) => m.model);
  const accuracy = metrics.map((m) => m.accuracy);
  const precision = metrics.map((m) => m.precision);
  const recall = metrics.map((m) => m.recall);

  if (accuracyChart) {
    accuracyChart.destroy();
  }
  if (prChart) {
    prChart.destroy();
  }

  accuracyChart = new Chart(document.getElementById("accuracyChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Accuracy", data: accuracy, backgroundColor: ["#1f77b4", "#ff7f0e", "#2ca02c"] }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { min: 0, max: 1 } },
      plugins: { legend: { display: false } },
    },
  });

  prChart = new Chart(document.getElementById("prChart"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Precision", data: precision, backgroundColor: "#0b6fcf" },
        { label: "Recall", data: recall, backgroundColor: "#13a193" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { min: 0, max: 1 } },
    },
  });
}

document.getElementById("uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("datasetFile");
  if (!fileInput.files.length) {
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  const response = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await response.json();
  if (!response.ok) {
    appendLog(`Upload failed: ${data.detail || "Unknown error"}`);
    return;
  }

  appendLog(`Upload complete: ${data.summary.filename}`);
  await refreshStatus();
});

async function startTraining(useUploaded) {
  const response = await fetch("/api/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ use_uploaded: useUploaded }),
  });
  const data = await response.json();
  if (!response.ok) {
    appendLog(`Training start failed: ${data.detail || "Unknown error"}`);
    return;
  }

  appendLog(`Training started (${useUploaded ? "uploaded" : "primary"} dataset)`);
}

document.getElementById("trainUploaded").addEventListener("click", () => startTraining(true));
document.getElementById("trainPrimary").addEventListener("click", () => startTraining(false));

document.getElementById("predictForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = document.getElementById("predictUrl").value;

  const response = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await response.json();

  if (!response.ok) {
    predictOutput.textContent = data.detail || "Prediction failed";
    return;
  }

  predictOutput.textContent = JSON.stringify(data, null, 2);
});

setInterval(async () => {
  await refreshLogs();
  await refreshStatus();
}, 1500);

refreshStatus();
refreshLogs();
