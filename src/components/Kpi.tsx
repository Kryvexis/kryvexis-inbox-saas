import { ReactNode } from "react";

export function Kpi({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: ReactNode }) {
  return (
    <div className="kx-card2 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-500">{label}</div>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
    </div>
  );
}
