"use client";

import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";

export default function AnalyticsPage() {
  const { state } = useStore();

  const open = state.conversations.filter((c) => c.status === "open").length;
  const fresh = state.conversations.filter((c) => c.status === "new").length;
  const waiting = state.conversations.filter((c) => c.status === "awaiting_customer").length;
  const resolved = state.conversations.filter((c) => c.status === "resolved").length;
  const messages24h = state.conversations.flatMap((c) => c.messages).filter((m) => {
    return Date.now() - new Date(m.createdAt).getTime() < 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Analytics</div>
        <div className="text-sm text-neutral-500">Operational KPIs for your inbox workflow.</div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label="Messages (24h)" value={messages24h} />
        <Kpi label="New" value={fresh} />
        <Kpi label="Open" value={open} />
        <Kpi label="Awaiting" value={waiting} />
        <Kpi label="Resolved" value={resolved} />
      </div>

      <div className="kx-card2 p-6">
        <div className="text-sm font-semibold">Operational summary</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600">
          <li>Every customer message can flow into one shared inbox.</li>
          <li>Agents can assign, note, and resolve conversations.</li>
          <li>Prepared replies reduce response time on common questions.</li>
          <li>Quotes and products keep sales follow-up close to the conversation.</li>
        </ul>
      </div>
    </div>
  );
}
