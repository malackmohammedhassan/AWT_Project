import { useCallback, useReducer } from "react";
import type { TrainingStatus } from "../../api/trainingTypes";

type Action =
  | { type: "SET_STATUS"; payload: TrainingStatus }
  | { type: "RESET" };

type State = {
  status: TrainingStatus;
};

const initialState: State = {
  status: "IDLE",
};

function reducer(state: State, action: Action): State {
  if (action.type === "RESET") {
    return initialState;
  }

  return {
    ...state,
    status: action.payload,
  };
}

export function useTrainingState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setStatus = useCallback((status: TrainingStatus) => {
    dispatch({ type: "SET_STATUS", payload: status });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    status: state.status,
    setStatus,
    reset,
  };
}
