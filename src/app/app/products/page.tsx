"use client";

import { useState } from "react";
import { useStore } from "@/components/StoreProvider";

export default function ProductsPage() {
  const { state, addProduct } = useStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xl font-semibold">Products</div>
          <div className="text-sm text-neutral-500">Catalog + pricing for a real sales demo.</div>
        </div>
        <div className="flex gap-2">
          <input className="kx-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="product name" />
          <input className="kx-input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="price" />
          <input className="kx-input" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="stock" />
          <button
            className="kx-btn kx-btn-primary"
            onClick={() => {
              addProduct(name, Number(price), Number(stock));
              setName("");
              setPrice("");
              setStock("");
            }}
          >
            Add product
          </button>
        </div>
      </div>

      <div className="kx-card2 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="p-3 text-left font-medium">Product</th>
              <th className="p-3 text-left font-medium">Price</th>
              <th className="p-3 text-left font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {state.products.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="p-3">{p.name}</td>
                <td className="p-3">R {p.price.toLocaleString()}</td>
                <td className="p-3">{p.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
