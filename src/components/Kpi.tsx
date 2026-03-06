export function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="kx-card2 p-4 sm:p-5">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{label}</div>
      <div className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
      {hint ? <div className="mt-2 text-sm text-neutral-500">{hint}</div> : null}
    </div>
  );
}
