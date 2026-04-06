type DatasetPanelSkeletonProps = {
  titleWidthClass?: string;
  heightClass?: string;
};

export function DatasetPanelSkeleton({
  titleWidthClass = "w-44",
  heightClass = "h-56",
}: DatasetPanelSkeletonProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <div className={`mb-4 h-4 animate-pulse rounded bg-slate-700 ${titleWidthClass}`} />
      <div className={`w-full animate-pulse rounded bg-slate-700 ${heightClass}`} />
    </section>
  );
}
