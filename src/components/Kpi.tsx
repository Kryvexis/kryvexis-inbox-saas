export function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="kx-card2 p-4">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
    </div>
  );
}
