"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";

export default function AutomationsPage() {
  const { state, addRule } = useStore();
  const [keyword, setKeyword] = useState("");
  const [autoReply, setAutoReply] = useState("");

  return (
    <div className="kx-page">
      <section className="kx-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Automation rules</div>
            <h1 className="mt-2 kx-section-title">Simple rules, cleaner rule presentation.</h1>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <Kpi label="Rules" value={state.rules.length} />
            <Kpi label="Enabled" value={state.rules.filter((r) => r.enabled).length} />
            <Kpi label="Coverage" value={`${Math.round((state.rules.filter((r) => r.enabled).length / Math.max(state.rules.length, 1)) * 100)}%`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="kx-card2 p-4 sm:p-5">
          <div className="kx-panel-title">Add rule</div>
          <div className="mt-4 space-y-3">
            <input className="kx-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Keyword e.g. price" />
            <textarea className="kx-input min-h-[120px] resize-none" value={autoReply} onChange={(e) => setAutoReply(e.target.value)} placeholder="Auto reply text" />
            <button
              className="kx-btn kx-btn-primary w-full"
              onClick={() => {
                addRule(keyword, autoReply);
                setKeyword("");
                setAutoReply("");
              }}
            >
              Add rule
            </button>
          </div>
        </div>

        <div className="grid gap-3">
          {state.rules.map((r) => (
            <div key={r.id} className="kx-card2 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="kx-badge">{r.keyword}</span>
                    <span className="kx-badge">{r.enabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
                <span className={r.enabled ? "kx-badge-dark" : "kx-badge"}>{r.enabled ? "Live" : "Paused"}</span>
              </div>
              <div className="mt-4 rounded-3xl bg-neutral-50 p-4 text-sm text-neutral-600">{r.autoReply}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
