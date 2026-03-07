"use client";

import { Kpi } from "@/components/Kpi";
import { useStore } from "@/components/StoreProvider";

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
        <div className="text-2xl font-semibold tracking-tight">Analytics</div>
        <div className="mt-1 text-sm text-neutral-500">A small set of numbers that helps you understand the current workload.</div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Messages 24h" value={messages24h} />
        <Kpi label="Open" value={open} />
        <Kpi label="Awaiting" value={pending} />
        <Kpi label="Resolved" value={closed} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card2 p-5">
          <div className="text-sm font-semibold">What matters today</div>
          <div className="mt-3 space-y-3 text-sm text-neutral-600">
            <div>Open work tells you how many active conversations still need action.</div>
            <div>Awaiting shows where the next move belongs to the customer.</div>
            <div>Resolved helps you see what has already been completed.</div>
          </div>
        </div>
        <div className="kx-card2 p-5">
          <div className="text-sm font-semibold">Simple use cases</div>
          <div className="mt-3 space-y-3 text-sm text-neutral-600">
            <div>Use the inbox to keep communication in one shared place.</div>
            <div>Use quotes and products to keep sales follow-up close to the conversation.</div>
            <div>Use notes and status updates to keep the team aligned.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
