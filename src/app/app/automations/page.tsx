"use client";

import { useMemo, useState } from "react";
import { Copy, Play, Search, Trash2, Zap } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";
import type { RuleChannel, RuleMatchType } from "@/lib/types";

export default function AutomationsPage() {
  const { state, addRule, toggleRule, duplicateRule, removeRule, triggerRuleSample } = useStore();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [autoReply, setAutoReply] = useState("");
  const [matchType, setMatchType] = useState<RuleMatchType>("contains");
  const [channel, setChannel] = useState<RuleChannel>("inbox");

  const filteredRules = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.rules.filter((rule) => {
      if (!q) return true;
      return [rule.name, rule.keyword, rule.autoReply, rule.channel].some((value) => value.toLowerCase().includes(q));
    });
  }, [query, state.rules]);

  const enabled = state.rules.filter((rule) => rule.enabled).length;
  const totalUsage = state.rules.reduce((sum, rule) => sum + rule.usageCount, 0);
  const quotesRules = state.rules.filter((rule) => rule.channel === "quotes" || rule.channel === "both").length;

  function resetForm() {
    setName("");
    setKeyword("");
    setAutoReply("");
    setMatchType("contains");
    setChannel("inbox");
  }

  function submitRule() {
    addRule({
      name: name.trim() || `Keyword: ${keyword}`,
      keyword,
      autoReply,
      matchType,
      channel,
    });
    resetForm();
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xl font-semibold">Automations</div>
          <div className="text-sm text-neutral-500">Keyword-based rules for inbox and quote workflows, with quick testing and usage tracking.</div>
        </div>
        <div className="relative min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input className="kx-input pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rules" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Kpi label="Active rules" value={enabled} />
        <Kpi label="Total rules" value={state.rules.length} />
        <Kpi label="Quote-ready rules" value={quotesRules} />
        <Kpi label="Rule triggers" value={totalUsage} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.6fr]">
        <div className="kx-card2 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Zap size={16} />
            Create automation
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Rule name</span>
              <input className="kx-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Price Auto-Reply" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Keyword</span>
              <input className="kx-input" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="price" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Match type</span>
              <select className="kx-input" value={matchType} onChange={(event) => setMatchType(event.target.value as RuleMatchType)}>
                <option value="contains">contains</option>
                <option value="exact">exact</option>
                <option value="startsWith">startsWith</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Channel</span>
              <select className="kx-input" value={channel} onChange={(event) => setChannel(event.target.value as RuleChannel)}>
                <option value="inbox">inbox</option>
                <option value="quotes">quotes</option>
                <option value="both">both</option>
              </select>
            </label>
            <label className="sm:col-span-2 grid gap-1 text-sm">
              <span className="text-neutral-600">Auto-reply</span>
              <textarea className="min-h-28 rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-black" value={autoReply} onChange={(event) => setAutoReply(event.target.value)} placeholder="Thanks — here are our latest prices and packages." />
            </label>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="kx-btn kx-btn-primary" onClick={submitRule}>Add rule</button>
            <button className="kx-btn kx-btn-ghost border border-neutral-200" onClick={resetForm}>Reset</button>
          </div>
        </div>

        <div className="kx-card2 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="p-3 text-left font-medium">Rule</th>
                <th className="p-3 text-left font-medium">Scope</th>
                <th className="p-3 text-left font-medium">Usage</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="border-t border-neutral-100 align-top">
                  <td className="p-3">
                    <div className="font-medium">{rule.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
                      <span className="kx-badge">{rule.keyword}</span>
                      <span className="kx-badge">{rule.matchType}</span>
                      <span className="kx-badge">{rule.enabled ? "enabled" : "paused"}</span>
                    </div>
                    <div className="mt-2 max-w-xl text-xs text-neutral-500">{rule.autoReply}</div>
                  </td>
                  <td className="p-3 text-xs text-neutral-600">
                    <div>{rule.channel}</div>
                    <div className="mt-1">Last trigger: {rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).toLocaleString() : "—"}</div>
                  </td>
                  <td className="p-3 font-medium">{rule.usageCount}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => toggleRule(rule.id)}>
                        {rule.enabled ? "Pause" : "Enable"}
                      </button>
                      <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => triggerRuleSample(rule.id)}>
                        <Play size={12} className="mr-1 inline" />Test
                      </button>
                      <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => duplicateRule(rule.id)}>
                        <Copy size={12} className="mr-1 inline" />Duplicate
                      </button>
                      <button className="rounded-xl border border-red-200 px-2 py-1 text-xs text-red-600" onClick={() => removeRule(rule.id)}>
                        <Trash2 size={12} className="mr-1 inline" />Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredRules.length ? <div className="p-6 text-sm text-neutral-500">No rules match your search yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
