import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import { useUploadDataset } from "../../contexts/UploadDatasetContext";

type WorkflowGuardProps = {
  children: ReactNode;
  requiredStep?: string;
};

export function WorkflowGuard({ children, requiredStep = "upload a dataset" }: WorkflowGuardProps) {
  const { uploadedDataset } = useUploadDataset();
  const navigate = useNavigate();

  if (!uploadedDataset) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-600/40 bg-red-600/10 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-600/20 p-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <h2 className="mb-2 text-xl font-bold text-red-100">Dataset Required</h2>
          <p className="mb-6 text-sm text-red-100/80">
            You need to {requiredStep} before accessing this page. Start from the Dashboard to
            upload your data.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600/40 px-6 py-2.5 font-medium text-red-100 transition-all hover:bg-red-600/60"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
