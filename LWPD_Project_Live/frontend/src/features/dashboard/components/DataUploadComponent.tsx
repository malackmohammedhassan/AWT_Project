import { Upload, FileUp, CheckCircle, AlertTriangle } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { parseJsonOrThrow } from "../../../api/liveApi";
import { useSelectedDataset } from "../../../contexts/SelectedDatasetContext";
import { useUploadDataset } from "../../../contexts/UploadDatasetContext";

type DataUploadComponentProps = {
  onUploadSuccess?: () => void;
};

const SUPPORTED_FORMATS = [".csv"];
const MAX_FILE_SIZE_MB = 100;

export function DataUploadComponent({ onUploadSuccess }: DataUploadComponentProps) {
  const { setSelectedDatasetId } = useSelectedDataset();
  const { uploadedDataset, isUploading, uploadError, setIsUploading, setUploadError, setUploadedDataset } =
    useUploadDataset();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      return false;
    }

    const hasValidExtension = SUPPORTED_FORMATS.some((format) => file.name.endsWith(format));
    if (!hasValidExtension) {
      setUploadError(`File format not supported. Accepted formats: ${SUPPORTED_FORMATS.join(", ")}`);
      return false;
    }

    return true;
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploadError(null);

      if (!validateFile(file)) {
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await parseJsonOrThrow<{
          message: string;
          summary: {
            filename: string;
            rows: number;
            columns: string[];
            class_distribution: Record<string, number>;
          };
        }>(response);

        const uploadedData = {
          id: "uploaded_dataset",
          name: file.name.replace(/\.[^/.]+$/, ""),
          fileName: data.summary.filename,
          uploadedAt: new Date(),
          rowCount: data.summary.rows,
          columnCount: data.summary.columns.length,
          columns: data.summary.columns,
          classDistribution: data.summary.class_distribution,
        };

        setUploadedDataset(uploadedData);
        setSelectedDatasetId("uploaded_dataset");
        onUploadSuccess?.();
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess, setIsUploading, setSelectedDatasetId, setUploadError, setUploadedDataset],
  );

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full">
      {!uploadedDataset ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
            isDragging
              ? "border-blue-400 bg-blue-500/10"
              : "border-gray-600 bg-gray-900/40 hover:border-gray-400"
          }`}
        >
          <div className="px-8 py-16 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-white">Upload Your Dataset</h2>
            <p className="mb-6 text-gray-300">
              Start your ML workflow by uploading a dataset to visualize, analyze, and train models
            </p>

            <div className="mb-6 flex items-center justify-center gap-2">
              <FileUp className="h-5 w-5 text-gray-400" />
              <p className="text-sm text-gray-400">
                Supported formats: {SUPPORTED_FORMATS.join(", ")} • Max {MAX_FILE_SIZE_MB}MB
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mb-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Choose File
                </>
              )}
            </button>

            <p className="text-xs text-gray-500">or drag and drop a file above</p>

            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_FORMATS.join(",")}
              onChange={handleFileSelect}
              disabled={isUploading}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-full bg-green-500/20 p-2">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-green-100">Dataset uploaded successfully!</h3>
              <div className="space-y-1 text-sm text-green-100/80">
                <p>
                  <span className="font-medium">File:</span> {uploadedDataset.fileName}
                </p>
                <p>
                  <span className="font-medium">Rows:</span>{" "}
                  {uploadedDataset.rowCount?.toLocaleString() || "Loading..."}
                </p>
                <p>
                  <span className="font-medium">Columns:</span> {uploadedDataset.columnCount || "Loading..."}
                </p>
                <p>
                  <span className="font-medium">Uploaded:</span>{" "}
                  {uploadedDataset.uploadedAt.toLocaleString()}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-green-300 hover:text-green-200 underline"
                >
                  Upload Different Dataset
                </button>
                {onUploadSuccess && (
                  <button
                    onClick={onUploadSuccess}
                    className="rounded-lg bg-green-600/40 px-3 py-1 text-sm font-medium text-green-100 hover:bg-green-600/60"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-200">{uploadError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
