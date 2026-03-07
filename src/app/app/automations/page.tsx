"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";

export default function AutomationsPage() {
  const { state, addRule } = useStore();
  const [keyword, setKeyword] = useState("");
  const [autoReply, setAutoReply] = useState("");

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Automations</div>
        <div className="mt-1 text-sm text-neutral-500">Create simple rules for common customer questions.</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="kx-card2 p-4">
          <div className="text-sm font-semibold">Active rules</div>
          <div className="mt-4 grid gap-3">
            {state.rules.map((r) => (
              <div key={r.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="mt-1 text-sm text-neutral-500">Reply: {r.autoReply}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="kx-badge">{r.keyword}</span>
                    <span className="kx-badge">{r.enabled ? "Enabled" : "Paused"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kx-card2 p-4">
          <div className="text-sm font-semibold">Add rule</div>
          <div className="mt-3 grid gap-3">
            <input className="kx-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Keyword" />
            <input className="kx-input" value={autoReply} onChange={(e) => setAutoReply(e.target.value)} placeholder="Auto reply" />
            <button
              className="kx-btn kx-btn-primary"
              onClick={() => {
                addRule(keyword, autoReply);
                setKeyword("");
                setAutoReply("");
              }}
            >
              Save rule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
