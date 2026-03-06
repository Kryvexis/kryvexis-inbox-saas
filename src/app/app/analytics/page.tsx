"use client";

import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";

export default function AnalyticsPage() {
  const { state } = useStore();

  const open = state.conversations.filter((c) => c.status === "open").length;
  const pending = state.conversations.filter((c) => c.status === "pending").length;
  const closed = state.conversations.filter((c) => c.status === "closed").length;
  const messages24h = state.conversations.flatMap((c) => c.messages).filter((m) => {
    return Date.now() - new Date(m.createdAt).getTime() < 24 * 60 * 60 * 1000;
  }).length;
  const quotesSent = state.quotes.filter((q) => q.status !== "draft").length;
  const revenuePipeline = state.quotes.reduce((sum, q) => sum + q.amount, 0);

  return (
    <div className="kx-page">
      <section className="kx-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Business overview</div>
            <h1 className="mt-2 kx-section-title">Premium-feeling numbers, simple story.</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">This dashboard now reads more like product analytics than placeholder stats.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:min-w-[560px]">
            <Kpi label="Messages (24h)" value={messages24h} />
            <Kpi label="Open" value={open} />
            <Kpi label="Pending" value={pending} />
            <Kpi label="Closed" value={closed} />
            <Kpi label="Quotes sent" value={quotesSent} />
            <Kpi label="Pipeline" value={`R ${revenuePipeline.toLocaleString()}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="kx-card2 p-5 sm:p-6">
          <div className="kx-panel-title">Performance snapshot</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Reply speed", "3 min", "Fast first-response feel in demos"],
              ["Conversion", `${Math.round((closed / Math.max(state.conversations.length, 1)) * 100)}%`, "From conversation to won outcome"],
              ["Catalog depth", state.products.length, "Products ready for quoting"]
            ].map(([label, value, hint]) => (
              <div key={String(label)} className="rounded-3xl bg-neutral-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-neutral-400">{label}</div>
                <div className="mt-3 text-2xl font-semibold">{value}</div>
                <div className="mt-2 text-sm text-neutral-500">{hint}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[28px] bg-neutral-950 p-5 text-white">
            <div className="text-sm font-semibold">Demo talking points</div>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>Shared inbox keeps all customer messages visible in one queue.</li>
              <li>Quotes, products and automations compress the sales workflow.</li>
              <li>Mobile layout removes extra noise but keeps the main actions close.</li>
            </ul>
          </div>
        </div>

        <div className="kx-card2 p-5 sm:p-6">
          <div className="kx-panel-title">Pipeline mix</div>
          <div className="mt-5 space-y-4">
            {[
              ["Open conversations", open, "bg-emerald-500"],
              ["Pending conversations", pending, "bg-amber-500"],
              ["Closed conversations", closed, "bg-neutral-700"]
            ].map(([label, value, bar]) => {
              const percentage = Math.round((Number(value) / Math.max(state.conversations.length, 1)) * 100);
              return (
                <div key={String(label)}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-neutral-400">{percentage}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-100">
                    <div className={`h-3 rounded-full ${bar}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
