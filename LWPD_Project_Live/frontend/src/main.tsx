import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./app/App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { GlobalFilterProvider } from "./contexts/GlobalFilterContext";
import { SelectedDatasetProvider } from "./contexts/SelectedDatasetContext";
import { UploadDatasetProvider } from "./contexts/UploadDatasetContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GlobalFilterProvider>
            <SelectedDatasetProvider>
              <UploadDatasetProvider>
                <App />
              </UploadDatasetProvider>
            </SelectedDatasetProvider>
          </GlobalFilterProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
