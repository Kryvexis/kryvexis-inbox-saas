"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";

export default function QuotesPage() {
  const { state, addQuote } = useStore();
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Quotes</div>
          <div className="text-sm text-neutral-500">Simple sales module for demos.</div>
        </div>
        <div className="flex gap-2">
          <input className="kx-input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="customer" />
          <input className="kx-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount" />
          <button
            className="kx-btn kx-btn-primary"
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
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="p-3 text-left font-medium">Customer</th>
              <th className="p-3 text-left font-medium">Amount</th>
              <th className="p-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {state.quotes.map((q) => (
              <tr key={q.id} className="border-t border-neutral-100">
                <td className="p-3">{q.customer}</td>
                <td className="p-3">R {q.amount.toLocaleString()}</td>
                <td className="p-3">{q.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
