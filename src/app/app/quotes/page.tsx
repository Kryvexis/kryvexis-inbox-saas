"use client";

import { useMemo, useState } from "react";
import { Copy, FilePlus2, Send, Search, Trash2, WandSparkles } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";
import type { QuoteStatus } from "@/lib/types";

function formatCurrency(value: number) {
  return `R ${value.toLocaleString()}`;
}

type DraftItem = {
  productId?: string;
  name: string;
  quantity: string;
  unitPrice: string;
};

const emptyItem: DraftItem = { name: "", quantity: "1", unitPrice: "0" };

export default function QuotesPage() {
  const { state, addQuote, updateQuoteStatus, duplicateQuote, removeQuote, createQuoteFromConversation } = useStore();
  const [query, setQuery] = useState("");
  const [customer, setCustomer] = useState("");
  const [contactId, setContactId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([{ ...emptyItem }]);

  const filteredQuotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.quotes.filter((quote) => {
      if (!q) return true;
      return [quote.customer, quote.status, quote.notes ?? ""].some((value) => value.toLowerCase().includes(q));
    });
  }, [query, state.quotes]);

  const sentCount = state.quotes.filter((quote) => quote.status === "sent").length;
  const acceptedCount = state.quotes.filter((quote) => quote.status === "accepted").length;
  const conversion = state.quotes.length ? `${Math.round((acceptedCount / state.quotes.length) * 100)}%` : "0%";
  const pipelineValue = state.quotes
    .filter((quote) => quote.status === "draft" || quote.status === "sent")
    .reduce((sum, quote) => sum + quote.total, 0);

  const draftTotals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);
    const safeDiscount = Math.max(0, Number(discount) || 0);
    return { subtotal, discount: safeDiscount, total: Math.max(0, subtotal - safeDiscount) };
  }, [discount, items]);

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function addLineItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeLineItem(index: number) {
    setItems((prev) => prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index));
  }

  function applyProduct(index: number, productId: string) {
    const product = state.products.find((item) => item.id === productId);
    if (!product) return;
    updateItem(index, { productId: product.id, name: product.name, unitPrice: String(product.price) });
  }

  function resetForm() {
    setCustomer("");
    setContactId("");
    setDiscount("0");
    setNotes("");
    setItems([{ ...emptyItem }]);
  }

  function submitQuote() {
    const fallbackCustomer = contactId ? state.contacts.find((contact) => contact.id === contactId)?.name ?? "" : "";
    const quoteId = addQuote({
      customer: customer.trim() || fallbackCustomer,
      contactId: contactId || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      discount: Number(discount) || 0,
      notes,
      status: "draft",
    });

    if (quoteId) resetForm();
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xl font-semibold">Quotes</div>
          <div className="text-sm text-neutral-500">Build quotes from products, track approvals, and generate fast sales momentum in demos.</div>
        </div>
        <div className="relative min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input className="kx-input pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, status, notes" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Kpi label="Pipeline value" value={formatCurrency(pipelineValue)} />
        <Kpi label="Sent quotes" value={sentCount} />
        <Kpi label="Accepted" value={acceptedCount} />
        <Kpi label="Conversion" value={conversion} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.6fr]">
        <div className="kx-card2 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FilePlus2 size={16} />
            Create quote
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Customer</span>
              <input className="kx-input" value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Sipho M." />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Contact</span>
              <select className="kx-input" value={contactId} onChange={(event) => setContactId(event.target.value)}>
                <option value="">Select contact</option>
                {state.contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>{contact.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {items.map((item, index) => (
              <div key={`item-${index}`} className="rounded-2xl border border-neutral-200 p-3">
                <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr_0.7fr_0.8fr_auto]">
                  <div className="grid gap-1 text-sm">
                    <span className="text-neutral-600">Line item</span>
                    <input className="kx-input" value={item.name} onChange={(event) => updateItem(index, { name: event.target.value })} placeholder="Business Package" />
                  </div>
                  <div className="grid gap-1 text-sm">
                    <span className="text-neutral-600">Product</span>
                    <select className="kx-input" value={item.productId ?? ""} onChange={(event) => applyProduct(index, event.target.value)}>
                      <option value="">Custom item</option>
                      {state.products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-1 text-sm">
                    <span className="text-neutral-600">Qty</span>
                    <input className="kx-input" inputMode="numeric" value={item.quantity} onChange={(event) => updateItem(index, { quantity: event.target.value })} />
                  </div>
                  <div className="grid gap-1 text-sm">
                    <span className="text-neutral-600">Unit price</span>
                    <input className="kx-input" inputMode="decimal" value={item.unitPrice} onChange={(event) => updateItem(index, { unitPrice: event.target.value })} />
                  </div>
                  <div className="flex items-end">
                    <button className="rounded-xl border border-red-200 px-3 py-2 text-xs text-red-600" onClick={() => removeLineItem(index)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button className="kx-btn kx-btn-ghost border border-neutral-200" onClick={addLineItem}>Add line item</button>
            <button className="kx-btn kx-btn-ghost border border-neutral-200" onClick={() => {
              const convo = state.conversations.find((conversation) => conversation.id === state.conversations[0]?.id);
              if (!convo) return;
              createQuoteFromConversation(convo.id);
            }}>
              <WandSparkles size={15} className="mr-2" />Quick quote from latest lead
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Discount</span>
              <input className="kx-input" inputMode="decimal" value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder="0" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Notes</span>
              <input className="kx-input" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Internal quote note" />
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm">
            <div className="flex items-center justify-between"><span className="text-neutral-600">Subtotal</span><span>{formatCurrency(draftTotals.subtotal)}</span></div>
            <div className="mt-1 flex items-center justify-between"><span className="text-neutral-600">Discount</span><span>- {formatCurrency(draftTotals.discount)}</span></div>
            <div className="mt-2 flex items-center justify-between text-base font-semibold"><span>Total</span><span>{formatCurrency(draftTotals.total)}</span></div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="kx-btn kx-btn-primary" onClick={submitQuote}>Save draft quote</button>
            <button className="kx-btn kx-btn-ghost border border-neutral-200" onClick={resetForm}>Reset</button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            {state.quotes.slice(0, 2).map((quote) => (
              <div key={`${quote.id}-hero`} className="kx-card2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{quote.customer}</div>
                    <div className="mt-1 text-xs text-neutral-500">{quote.items.length} items • valid until {new Date(quote.validUntil).toLocaleDateString()}</div>
                  </div>
                  <span className="kx-badge">{quote.status}</span>
                </div>
                <div className="mt-4 text-2xl font-semibold">{formatCurrency(quote.total)}</div>
                <div className="mt-2 text-sm text-neutral-600">{quote.notes || "No internal notes yet."}</div>
              </div>
            ))}
          </div>

          <div className="kx-card2 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="p-3 text-left font-medium">Customer</th>
                  <th className="p-3 text-left font-medium">Total</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="border-t border-neutral-100 align-top">
                    <td className="p-3">
                      <div className="font-medium">{quote.customer}</div>
                      <div className="text-xs text-neutral-500">{quote.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}</div>
                      {quote.notes ? <div className="mt-1 text-xs text-neutral-500">{quote.notes}</div> : null}
                    </td>
                    <td className="p-3 font-medium">{formatCurrency(quote.total)}</td>
                    <td className="p-3">
                      <select className="rounded-xl border border-neutral-200 px-3 py-2 text-xs" value={quote.status} onChange={(event) => updateQuoteStatus(quote.id, event.target.value as QuoteStatus)}>
                        <option value="draft">draft</option>
                        <option value="sent">sent</option>
                        <option value="accepted">accepted</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => updateQuoteStatus(quote.id, "sent")}>
                          <Send size={12} className="mr-1 inline" />Send
                        </button>
                        <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => duplicateQuote(quote.id)}>
                          <Copy size={12} className="mr-1 inline" />Duplicate
                        </button>
                        <button className="rounded-xl border border-red-200 px-2 py-1 text-xs text-red-600" onClick={() => removeQuote(quote.id)}>
                          <Trash2 size={12} className="mr-1 inline" />Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredQuotes.length ? <div className="p-6 text-sm text-neutral-500">No quotes match your search yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
