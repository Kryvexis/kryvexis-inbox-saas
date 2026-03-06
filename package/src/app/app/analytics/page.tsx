"use client";

import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";

export default function AnalyticsPage() {
  const { state } = useStore();

  const queueOpen = state.conversations.filter((c) => c.status === "new" || c.status === "open").length;
  const waiting = state.conversations.filter((c) => c.status === "waiting").length;
  const resolved = state.conversations.filter((c) => c.status === "resolved").length;
  const unread = state.conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Analytics</div>
        <div className="text-sm text-neutral-500">Operational visibility for conversation handling, follow-up, and response workload.</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Kpi label="Unread messages" value={unread} />
        <Kpi label="Open queue" value={queueOpen} />
        <Kpi label="Awaiting customer" value={waiting} />
        <Kpi label="Resolved" value={resolved} />
      </div>

      <div className="kx-card2 p-6">
        <div className="text-sm font-semibold">Meta-ready workflow highlights</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-600">
          <li>Every conversation already carries a source channel and unread count.</li>
          <li>Outbound replies support delivery-state badges for sent, delivered, and read states.</li>
          <li>Queue statuses match a practical operator flow: new, open, awaiting customer, resolved.</li>
          <li>Notes, labels, and assignment are ready for later persistence and webhook updates.</li>
        </ul>
      </div>
    </div>
  );
}
