import { memo, useEffect, useRef } from "react";

type LiveLogConsoleProps = {
  lines: string[];
};

function LiveLogConsoleComponent({ lines }: LiveLogConsoleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <h3 className="mb-3 text-xl font-medium text-slate-100">Log</h3>
      <div
        ref={containerRef}
        className="h-[220px] overflow-y-auto rounded-md border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-emerald-200"
      >
        {lines.map((line, idx) => (
          <div key={`${line}-${idx}`} className="mb-1 whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}

export const LiveLogConsole = memo(LiveLogConsoleComponent);
