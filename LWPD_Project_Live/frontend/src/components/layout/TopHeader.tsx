import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function TopHeader() {
  const { pathname } = useLocation();

  const title = useMemo(() => {
    if (pathname.startsWith("/datasets")) {
      return "Datasets";
    }
    if (pathname.startsWith("/training")) {
      return "Training";
    }
    if (pathname.startsWith("/prediction")) {
      return "Prediction";
    }
    if (pathname.startsWith("/experiments")) {
      return "Experiments Lab";
    }
    return "Dashboard";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-10 mb-6 flex h-16 items-center rounded-xl border border-slate-700 bg-slate-800/70 px-5 backdrop-blur-md">
      <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
    </header>
  );
}
