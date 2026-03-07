"use client";

import { useMemo, useState } from "react";
import { Kpi } from "@/components/Kpi";
import { useStore } from "@/components/StoreProvider";

export default function QuotesPage() {
  const { state, addQuote } = useStore();
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [query, setQuery] = useState("");

  const quotes = useMemo(() => state.quotes.filter((q) => !query.trim() || q.customer.toLowerCase().includes(query.toLowerCase())), [query, state.quotes]);
  const draftCount = state.quotes.filter((q) => q.status === "draft").length;
  const approvedCount = state.quotes.filter((q) => q.status === "approved").length;

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Quotes</div>
        <div className="mt-1 text-sm text-neutral-500">Keep quote work simple: who it is for, value, and current status.</div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kpi label="Quotes" value={state.quotes.length} />
        <Kpi label="Draft" value={draftCount} />
        <Kpi label="Approved" value={approvedCount} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="kx-card2 p-4">
          <input className="kx-input md:max-w-sm" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quotes" />
          <div className="mt-4 grid gap-3">
            {quotes.map((q) => (
              <div key={q.id} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium">{q.customer}</div>
                    <div className="mt-1 text-sm text-neutral-500">R {q.amount.toLocaleString()}</div>
                  </div>
                  <span className="kx-badge">{q.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="kx-card2 p-4">
          <div className="text-sm font-semibold">Create quote</div>
          <div className="mt-3 grid gap-3">
            <input className="kx-input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer" />
            <input className="kx-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
            <button
              className="kx-btn kx-btn-primary"
              onClick={() => {
                addQuote(customer, Number(amount));
                setCustomer("");
                setAmount("");
              }}
            >
              Save quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
