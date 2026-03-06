"use client";

import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";

export default function SettingsPage() {
  const { state } = useStore();

  return (
    <div className="kx-page">
      <section className="kx-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Workspace settings</div>
            <h1 className="mt-2 kx-section-title">A cleaner admin page with fewer noisy controls.</h1>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <Kpi label="Team" value={state.team.length} />
            <Kpi label="Products" value={state.products.length} />
            <Kpi label="Rules" value={state.rules.length} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="kx-card2 p-5 sm:p-6">
          <div className="kx-panel-title">Workspace</div>
          <div className="mt-5 grid gap-3 text-sm text-neutral-600">
            {[
              ["Name", "Kryvexis Inbox"],
              ["Plan", "Showcase"],
              ["Mode", "No APIs attached yet"],
              ["Mobile approach", "Focused UI with reduced visible controls"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl bg-neutral-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{label}</div>
                <div className="mt-2 font-medium text-neutral-900">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="kx-card2 p-5 sm:p-6">
          <div className="kx-panel-title">Team</div>
          <div className="mt-5 space-y-3">
            {state.team.map((m) => (
              <div key={m.id} className="rounded-3xl border border-neutral-200 bg-white p-4 text-sm shadow-sm">
                <div className="font-medium">{m.name}</div>
                <div className="mt-1 text-neutral-500">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
