"use client";

import { useMemo, useState } from "react";
import { Kpi } from "@/components/Kpi";
import { useStore } from "@/components/StoreProvider";

export default function ProductsPage() {
  const { state, addProduct } = useStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [query, setQuery] = useState("");

  const products = useMemo(() => state.products.filter((p) => !query.trim() || p.name.toLowerCase().includes(query.toLowerCase())), [query, state.products]);
  const lowStock = state.products.filter((p) => p.stock <= 5).length;

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Products</div>
        <div className="mt-1 text-sm text-neutral-500">A cleaner catalog view with only the details you need first.</div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kpi label="Items" value={state.products.length} />
        <Kpi label="Low stock" value={lowStock} />
        <Kpi label="Catalog value" value={`R ${state.products.reduce((sum, p) => sum + p.price, 0).toLocaleString()}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="kx-card2 p-4">
          <input className="kx-input md:max-w-sm" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" />
          <div className="mt-4 grid gap-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-neutral-200 p-4">
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
        </div>

        <div className="kx-card2 p-4">
          <div className="text-sm font-semibold">Add product</div>
          <div className="mt-3 grid gap-3">
            <input className="kx-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
            <input className="kx-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
            <input className="kx-input" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" />
            <button
              className="kx-btn kx-btn-primary"
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
      </div>
    </div>
  );
}
