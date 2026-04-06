import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("UI rendering error captured by ErrorBoundary", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100">
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-6 text-center">
            <h1 className="mb-2 text-lg font-semibold">Something went wrong.</h1>
            <p className="text-sm text-slate-300">Please refresh the page to recover.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
