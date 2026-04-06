import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { DatasetsPage } from "../features/shared/pages/DatasetsPage";
import { TrainingPage } from "../features/shared/pages/TrainingPage";
import { PredictionPage } from "../features/shared/pages/PredictionPage";
import { ExperimentsPage } from "../features/shared/pages/ExperimentsPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/datasets" element={<DatasetsPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}
