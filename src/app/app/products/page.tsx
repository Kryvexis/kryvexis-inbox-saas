"use client";

import { useMemo, useState } from "react";
import { Kpi } from "@/components/Kpi";
import { useStore } from "@/components/StoreProvider";
import { Package, Search, Tag } from "lucide-react";

export default function ProductsPage() {
  const { state, addProduct } = useStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [query, setQuery] = useState("");

  const products = useMemo(
    () => state.products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [query, state.products]
  );

  const inventoryValue = state.products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = state.products.filter((p) => p.stock <= 5).length;

  return (
    <div className="kx-page">
      <section className="kx-card p-4 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Product catalog</div>
            <h1 className="mt-2 kx-section-title">Cleaner catalog cards, better list density.</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">Desktop shows the fuller management view. Mobile keeps only the highest-value controls visible.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:min-w-[560px]">
            <Kpi label="Products" value={state.products.length} />
            <Kpi label="Low stock" value={lowStock} />
            <Kpi label="Avg price" value={`R ${Math.round(state.products.reduce((sum, p) => sum + p.price, 0) / Math.max(state.products.length, 1)).toLocaleString()}`} />
            <Kpi label="Inventory value" value={`R ${inventoryValue.toLocaleString()}`} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="kx-card2 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold"><Package size={16} /> Add product</div>
          <div className="mt-4 space-y-3">
            <input className="kx-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
            <input className="kx-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
            <input className="kx-input" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" />
            <button
              className="kx-btn kx-btn-primary w-full"
              onClick={() => {
                addProduct(name, Number(price), Number(stock));
                setName("");
                setPrice("");
                setStock("");
              }}
            >
              Save product
            </button>
          </div>
        </div>

        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-100 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="kx-panel-title">Catalog</div>
                <div className="mt-1 text-sm text-neutral-500">Scan price and stock at a glance.</div>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input className="kx-input pl-11" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:hidden">
            {products.map((p) => (
              <div key={p.id} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-1 text-sm text-neutral-500">R {p.price.toLocaleString()}</div>
                  </div>
                  <span className="kx-badge">{p.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="p-4 text-left font-medium">Product</th>
                  <th className="p-4 text-left font-medium">Price</th>
                  <th className="p-4 text-left font-medium">Stock</th>
                  <th className="p-4 text-left font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-neutral-100">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-neutral-100 p-2"><Tag size={16} /></div>
                        <div className="font-medium">{p.name}</div>
                      </div>
                    </td>
                    <td className="p-4">R {p.price.toLocaleString()}</td>
                    <td className="p-4">{p.stock}</td>
                    <td className="p-4">R {(p.price * p.stock).toLocaleString()}</td>
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
