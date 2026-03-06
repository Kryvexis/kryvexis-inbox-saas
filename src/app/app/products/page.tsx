"use client";

import { useMemo, useState } from "react";
import { Boxes, Copy, PackagePlus, Pencil, Search, Sparkles, Trash2 } from "lucide-react";
import { Kpi } from "@/components/Kpi";
import { useStore } from "@/components/StoreProvider";
import type { Product, ProductStatus } from "@/lib/types";

type ProductDraft = {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  status: ProductStatus;
  featured: boolean;
};

const emptyDraft: ProductDraft = {
  name: "",
  sku: "",
  category: "Packages",
  description: "",
  price: "",
  stock: "",
  status: "active",
  featured: false,
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductsPage() {
  const { state, addProduct, updateProduct, removeProduct, duplicateProduct, adjustProductStock, toggleProductStatus } = useStore();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return state.products;
    return state.products.filter((product) =>
      [product.name, product.sku, product.category, product.description]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [query, state.products]);

  const activeProducts = state.products.filter((product) => product.status === "active").length;
  const featuredProducts = state.products.filter((product) => product.featured).length;
  const lowStock = state.products.filter((product) => product.stock <= 5).length;
  const catalogValue = state.products.reduce((sum, product) => sum + product.price * product.stock, 0);

  function resetForm() {
    setDraft(emptyDraft);
    setEditingId(null);
  }

  function loadProduct(product: Product) {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
      featured: product.featured,
    });
  }

  function submitProduct() {
    const price = Number(draft.price);
    const stock = Number(draft.stock);
    if (!draft.name.trim() || Number.isNaN(price) || Number.isNaN(stock)) return;

    const payload = {
      name: draft.name.trim(),
      sku: draft.sku.trim(),
      category: draft.category.trim(),
      description: draft.description.trim(),
      price,
      stock,
      status: draft.status,
      featured: draft.featured,
    } satisfies Omit<Product, "id" | "updatedAt">;

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }

    resetForm();
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xl font-semibold">Products</div>
          <div className="text-sm text-neutral-500">Build a cleaner catalog with editable SKUs, featured items, and quick stock actions.</div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              className="kx-input pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, SKU, category"
            />
          </div>
          <button className="kx-btn kx-btn-ghost border border-neutral-200" onClick={resetForm}>
            {editingId ? "Cancel edit" : "Clear form"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Kpi label="Catalog value" value={formatCurrency(catalogValue)} />
        <Kpi label="Active products" value={activeProducts} />
        <Kpi label="Featured" value={featuredProducts} />
        <Kpi label="Low stock" value={lowStock} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.6fr]">
        <div className="kx-card2 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <PackagePlus size={16} />
            {editingId ? "Edit product" : "Add product"}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Name</span>
              <input className="kx-input" value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} placeholder="Business Package" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">SKU</span>
              <input className="kx-input" value={draft.sku} onChange={(event) => setDraft((prev) => ({ ...prev, sku: event.target.value }))} placeholder="KX-BIZ-010" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Category</span>
              <input className="kx-input" value={draft.category} onChange={(event) => setDraft((prev) => ({ ...prev, category: event.target.value }))} placeholder="Packages" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Status</span>
              <select className="kx-input" value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as ProductStatus }))}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Price</span>
              <input className="kx-input" inputMode="decimal" value={draft.price} onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))} placeholder="1499" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-neutral-600">Stock</span>
              <input className="kx-input" inputMode="numeric" value={draft.stock} onChange={(event) => setDraft((prev) => ({ ...prev, stock: event.target.value }))} placeholder="7" />
            </label>
            <label className="sm:col-span-2 grid gap-1 text-sm">
              <span className="text-neutral-600">Description</span>
              <textarea className="min-h-28 rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-black" value={draft.description} onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))} placeholder="What makes this product easy to sell?" />
            </label>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((prev) => ({ ...prev, featured: event.target.checked }))} />
            Mark as featured in demos
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="kx-btn kx-btn-primary" onClick={submitProduct}>
              {editingId ? "Save changes" : "Add product"}
            </button>
            <button className="kx-btn kx-btn-ghost border border-neutral-200" onClick={resetForm}>
              Reset
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            {filteredProducts.slice(0, 2).map((product) => (
              <div key={`${product.id}-hero`} className="kx-card2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Boxes size={16} />
                      {product.name}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">{product.sku} • {product.category}</div>
                  </div>
                  {product.featured ? <span className="kx-badge"><Sparkles size={12} className="mr-1 inline" />Featured</span> : null}
                </div>
                <div className="mt-3 text-sm text-neutral-600">{product.description || "No description yet."}</div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold">{formatCurrency(product.price)}</span>
                  <span className={product.stock <= 5 ? "text-amber-600" : "text-neutral-500"}>{product.stock} in stock</span>
                </div>
              </div>
            ))}
          </div>

          <div className="kx-card2 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="p-3 text-left font-medium">Product</th>
                  <th className="p-3 text-left font-medium">Price</th>
                  <th className="p-3 text-left font-medium">Stock</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-neutral-100 align-top">
                    <td className="p-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-neutral-500">{product.sku} • {product.category}</div>
                      {product.description ? <div className="mt-1 max-w-xl text-xs text-neutral-500">{product.description}</div> : null}
                    </td>
                    <td className="p-3 font-medium">{formatCurrency(product.price)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => adjustProductStock(product.id, -1)}>-1</button>
                        <span className={product.stock <= 5 ? "font-medium text-amber-600" : "font-medium"}>{product.stock}</span>
                        <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => adjustProductStock(product.id, 1)}>+1</button>
                      </div>
                    </td>
                    <td className="p-3">
                      <button className={product.status === "active" ? "kx-badge" : "rounded-full border border-neutral-300 px-2 py-1 text-xs text-neutral-600"} onClick={() => toggleProductStatus(product.id)}>
                        {product.status}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => loadProduct(product)}>
                          <Pencil size={12} className="mr-1 inline" />Edit
                        </button>
                        <button className="rounded-xl border border-neutral-200 px-2 py-1 text-xs" onClick={() => duplicateProduct(product.id)}>
                          <Copy size={12} className="mr-1 inline" />Duplicate
                        </button>
                        <button className="rounded-xl border border-red-200 px-2 py-1 text-xs text-red-600" onClick={() => removeProduct(product.id)}>
                          <Trash2 size={12} className="mr-1 inline" />Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filteredProducts.length ? (
              <div className="p-6 text-sm text-neutral-500">No products match your search yet.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
