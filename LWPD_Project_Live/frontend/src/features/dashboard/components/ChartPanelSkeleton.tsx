type ChartPanelSkeletonProps = {
  titleWidthClass?: string;
  bodyHeightClass?: string;
};

export function ChartPanelSkeleton({
  titleWidthClass = "w-40",
  bodyHeightClass = "h-64",
}: ChartPanelSkeletonProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className={`mb-4 h-4 animate-pulse rounded bg-slate-700 ${titleWidthClass}`} />
      <div className={`w-full animate-pulse rounded bg-slate-700 ${bodyHeightClass}`} />
    </section>
  );
}
