"use client";

import { Kpi } from "@/components/Kpi";
import { useStore } from "@/components/StoreProvider";

function formatCurrency(value: number) {
  return `R ${value.toLocaleString()}`;
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max(8, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100">
        <div className="h-2 rounded-full bg-black" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { state } = useStore();

  const open = state.conversations.filter((c) => c.status === "open").length;
  const pending = state.conversations.filter((c) => c.status === "pending").length;
  const closed = state.conversations.filter((c) => c.status === "closed").length;
  const messages24h = state.conversations.flatMap((c) => c.messages).filter((m) => Date.now() - new Date(m.createdAt).getTime() < 24 * 60 * 60 * 1000).length;
  const leadContacts = state.contacts.filter((c) => c.tags.includes("lead")).length;
  const acceptedQuotes = state.quotes.filter((q) => q.status === "accepted").length;
  const sentQuotes = state.quotes.filter((q) => q.status === "sent").length;
  const quoteConversion = state.quotes.length ? `${Math.round((acceptedQuotes / state.quotes.length) * 100)}%` : "0%";
  const revenueWon = state.quotes.filter((q) => q.status === "accepted").reduce((sum, quote) => sum + quote.total, 0);
  const pipelineValue = state.quotes.filter((q) => q.status === "draft" || q.status === "sent").reduce((sum, quote) => sum + quote.total, 0);
  const rulesTriggered = state.rules.reduce((sum, rule) => sum + rule.usageCount, 0);
  const teamLoad = state.team.map((member) => ({
    name: member.name,
    open: state.conversations.filter((conversation) => conversation.assignedTo === member.id && conversation.status !== "closed").length,
  }));
  const productMix = state.products.map((product) => ({ name: product.name, stock: product.stock }));

  const maxTeamLoad = Math.max(1, ...teamLoad.map((item) => item.open));
  const maxStock = Math.max(1, ...productMix.map((item) => item.stock));

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Analytics</div>
        <div className="text-sm text-neutral-500">Faster demo storytelling across inbox performance, sales pipeline, and automation lift.</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Messages (24h)" value={messages24h} hint="Recent customer and agent activity" />
        <Kpi label="Lead contacts" value={leadContacts} hint="Contacts tagged as lead" />
        <Kpi label="Pipeline value" value={formatCurrency(pipelineValue)} hint="Draft + sent quotes" />
        <Kpi label="Won revenue" value={formatCurrency(revenueWon)} hint="Accepted quotes only" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="kx-card2 p-5">
          <div className="text-sm font-semibold">Operations snapshot</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Open" value={open} />
            <Kpi label="Pending" value={pending} />
            <Kpi label="Closed" value={closed} />
            <Kpi label="Quote conversion" value={quoteConversion} />
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 p-4">
              <div className="text-sm font-semibold">Team workload</div>
              <div className="mt-4 space-y-4">
                {teamLoad.map((item) => <Bar key={item.name} label={item.name} value={item.open} max={maxTeamLoad} />)}
              </div>
            </div>
            <div className="rounded-2xl border border-neutral-200 p-4">
              <div className="text-sm font-semibold">Product stock mix</div>
              <div className="mt-4 space-y-4">
                {productMix.map((item) => <Bar key={item.name} label={item.name} value={item.stock} max={maxStock} />)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="kx-card2 p-5">
            <div className="text-sm font-semibold">Automation lift</div>
            <div className="mt-3 text-3xl font-semibold">{rulesTriggered}</div>
            <div className="mt-1 text-sm text-neutral-500">Total automated rule triggers captured in the demo workspace.</div>
            <div className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
              Best demo line: "Common questions are handled instantly, while the team focuses on closing real conversations."
            </div>
          </div>

          <div className="kx-card2 p-5">
            <div className="text-sm font-semibold">What to say in demos</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-600">
              <li>Every customer message lands in one shared inbox with ownership and status tracking.</li>
              <li>Quotes connect products, contacts, and conversations in one flow.</li>
              <li>Analytics surface both pipeline value and operational load in real time.</li>
              <li>Automations reduce response time and increase consistency without extra headcount.</li>
            </ul>
          </div>

          <div className="kx-card2 p-5">
            <div className="text-sm font-semibold">Quote activity</div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-neutral-200 p-3">
                <div className="text-neutral-500">Sent</div>
                <div className="mt-1 text-xl font-semibold">{sentQuotes}</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-3">
                <div className="text-neutral-500">Accepted</div>
                <div className="mt-1 text-xl font-semibold">{acceptedQuotes}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
