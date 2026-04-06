import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

type PredictionNavParams = {
  modelId?: string;
  sampleId?: string;
  autoRun?: boolean;
};

export function useGlobalNavigate() {
  const navigate = useNavigate();

  const toPrediction = useCallback(
    (params: PredictionNavParams) => {
      const query = new URLSearchParams();
      if (params.modelId) {
        query.set("modelId", params.modelId);
      }
      if (params.sampleId) {
        query.set("sampleId", params.sampleId);
      }
      if (params.autoRun) {
        query.set("autorun", "1");
      }
      const suffix = query.toString();
      navigate(suffix ? `/prediction?${suffix}` : "/prediction");
    },
    [navigate],
  );

  const toDatasets = useCallback(
    (datasetId?: string) => {
      const query = new URLSearchParams();
      if (datasetId) {
        query.set("datasetId", datasetId);
      }
      const suffix = query.toString();
      navigate(suffix ? `/datasets?${suffix}` : "/datasets");
    },
    [navigate],
  );

  const toExperiments = useCallback(
    (preselectRunId?: string) => {
      const query = new URLSearchParams();
      if (preselectRunId) {
        query.set("preselectRunId", preselectRunId);
      }
      const suffix = query.toString();
      navigate(suffix ? `/experiments?${suffix}` : "/experiments");
    },
    [navigate],
  );

  return {
    toPrediction,
    toDatasets,
    toExperiments,
  };
}
