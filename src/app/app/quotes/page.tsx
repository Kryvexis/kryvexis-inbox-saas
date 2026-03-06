"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";
import { Search } from "lucide-react";

export default function QuotesPage() {
  const { state, addQuote } = useStore();
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [query, setQuery] = useState("");

  const quotes = useMemo(() => state.quotes.filter((q) => q.customer.toLowerCase().includes(query.toLowerCase())), [query, state.quotes]);
  const totalValue = state.quotes.reduce((sum, q) => sum + q.amount, 0);

  return (
    <div className="kx-page">
      <section className="kx-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Sales quotes</div>
            <h1 className="mt-2 kx-section-title">Quoting UI that feels more sales-ready.</h1>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <Kpi label="Quotes" value={state.quotes.length} />
            <Kpi label="Sent" value={state.quotes.filter((q) => q.status !== "draft").length} />
            <Kpi label="Total value" value={`R ${totalValue.toLocaleString()}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="kx-card2 p-4 sm:p-5">
          <div className="kx-panel-title">Create quote</div>
          <div className="mt-4 space-y-3">
            <input className="kx-input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer" />
            <input className="kx-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
            <button
              className="kx-btn kx-btn-primary w-full"
              onClick={() => {
                addQuote(customer, Number(amount));
                setCustomer("");
                setAmount("");
              }}
            >
              Add quote
            </button>
          </div>
        </div>

        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-100 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="kx-panel-title">Quote pipeline</div>
                <div className="mt-1 text-sm text-neutral-500">Cleaner statuses and easier scanning.</div>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input className="kx-input pl-11" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quotes" />
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:hidden">
            {quotes.map((q) => (
              <div key={q.id} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{q.customer}</div>
                    <div className="mt-1 text-sm text-neutral-500">R {q.amount.toLocaleString()}</div>
                  </div>
                  <span className="kx-badge">{q.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="p-4 text-left font-medium">Customer</th>
                  <th className="p-4 text-left font-medium">Amount</th>
                  <th className="p-4 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="border-t border-neutral-100">
                    <td className="p-4 font-medium">{q.customer}</td>
                    <td className="p-4">R {q.amount.toLocaleString()}</td>
                    <td className="p-4"><span className="kx-badge">{q.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
