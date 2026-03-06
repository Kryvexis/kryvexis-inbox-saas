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

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Analytics</div>
        <div className="text-sm text-neutral-500">Operational KPIs for customer response, workload, and sales activity.</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Kpi label="Messages (24h)" value={messages24h} />
        <Kpi label="Open" value={open} />
        <Kpi label="Pending" value={pending} />
        <Kpi label="Closed" value={closed} />
      </div>

      <div className="kx-card2 p-6">
        <div className="text-sm font-semibold">Operational highlights</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600">
          <li>Every customer message lands in one shared inbox.</li>
          <li>Agents can assign, note, and close conversations.</li>
          <li>Automations answer common questions instantly.</li>
          <li>Quotes and product information help move enquiries toward conversion.</li>
        </ul>
      </div>
    </div>
  );
}
