export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className="mb-3 h-4 w-28 animate-pulse rounded bg-slate-700" />
      <div className="h-9 w-16 animate-pulse rounded bg-slate-700" />
    </div>
  );
}
