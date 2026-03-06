"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";

export default function AutomationsPage() {
  const { state, addRule } = useStore();
  const [keyword, setKeyword] = useState("");
  const [autoReply, setAutoReply] = useState("");

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Automations</div>
          <div className="text-sm text-neutral-500">Keyword triggers for instant replies.</div>
        </div>

        <div className="flex gap-2">
          <input className="kx-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="keyword (e.g. price)" />
          <input className="kx-input" value={autoReply} onChange={(e) => setAutoReply(e.target.value)} placeholder="auto reply text" />
          <button
            className="kx-btn kx-btn-primary"
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

      <div className="kx-card2 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Keyword</th>
              <th className="p-3 text-left font-medium">Auto reply</th>
              <th className="p-3 text-left font-medium">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {state.rules.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="p-3">{r.name}</td>
                <td className="p-3"><span className="kx-badge">{r.keyword}</span></td>
                <td className="p-3">{r.autoReply}</td>
                <td className="p-3">{r.enabled ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
