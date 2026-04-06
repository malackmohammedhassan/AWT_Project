type KpiCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
};

export function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow-md">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-1 text-5xl font-semibold tracking-tight text-slate-100">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
    </article>
  );
}
