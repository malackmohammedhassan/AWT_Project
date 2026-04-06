import { Upload } from "lucide-react";
import { memo, useState } from "react";
import { useUploadPredictionData } from "../../hooks/prediction/useUploadPredictionData";

type PredictionDataUploadProps = {
  onUploaded: (fileName: string) => void;
};

function PredictionDataUploadComponent({ onUploaded }: PredictionDataUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const uploadMutation = useUploadPredictionData();

  async function handleFile(file: File) {
    const response = await uploadMutation.mutateAsync(file.name);
    onUploaded(response.filename);
  }

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-3xl font-medium text-slate-100">Input test data</h3>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) {
            void handleFile(dropped);
          }
        }}
        className={[
          "flex h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center transition",
          dragActive ? "border-emerald-400 bg-emerald-500/10" : "border-slate-600 bg-slate-900/60",
        ].join(" ")}
      >
        <Upload className="mb-3 h-10 w-10 text-slate-300" />
        <p className="text-lg text-slate-200">File images or files</p>
        <span className="mt-2 inline-flex rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
          {uploadMutation.isPending ? "Uploading..." : "File upload"}
        </span>
        <input
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
          }}
        />
      </label>
      {uploadMutation.isSuccess ? (
        <p className="mt-2 text-xs text-emerald-300">Uploaded: {uploadMutation.data.filename}</p>
      ) : null}
    </section>
  );
}

export const PredictionDataUpload = memo(PredictionDataUploadComponent);
