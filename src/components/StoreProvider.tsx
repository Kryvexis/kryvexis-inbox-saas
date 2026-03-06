"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedState } from "@/lib/seed";
import type { AppState, Conversation, Rule, Contact, Quote, Product, Message } from "@/lib/types";

type Store = {
  state: AppState;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, body: string) => void;
  injectLead: () => void;
  addRule: (keyword: string, autoReply: string) => void;
  addNote: (conversationId: string, body: string) => void;
  updateStatus: (conversationId: string, status: Conversation["status"]) => void;
  addQuote: (customer: string, amount: number) => void;
  addProduct: (product: Omit<Product, "id" | "updatedAt">) => void;
  updateProduct: (productId: string, updates: Partial<Omit<Product, "id" | "updatedAt">>) => void;
  removeProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => void;
  adjustProductStock: (productId: string, delta: number) => void;
  toggleProductStatus: (productId: string) => void;
};

const StoreContext = createContext<Store | null>(null);
const KEY = "kryvexis_showcase_state_v2";

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function slugify(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 12);
}

function normalizeProduct(input: Partial<Product>, index: number): Product {
  const name = input.name?.trim() || `Product ${index + 1}`;
  const skuBase = input.sku?.trim() || slugify(name) || `ITEM-${index + 1}`;
  return {
    id: input.id || uid("p"),
    name,
    sku: skuBase,
    category: input.category?.trim() || "General",
    description: input.description?.trim() || "",
    price: typeof input.price === "number" && Number.isFinite(input.price) ? input.price : 0,
    stock: typeof input.stock === "number" && Number.isFinite(input.stock) ? input.stock : 0,
    status: input.status === "draft" ? "draft" : "active",
    featured: Boolean(input.featured),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

function normalizeState(input: AppState): AppState {
  return {
    ...input,
    products: (input.products ?? []).map((product, index) => normalizeProduct(product, index)),
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(seedState.conversations[0]?.id ?? null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem("kryvexis_showcase_state_v1");
      if (raw) {
        const parsed = normalizeState(JSON.parse(raw) as AppState);
        setState(parsed);
        setSelectedConversationId(parsed.conversations[0]?.id ?? null);
      }
    } catch {
      setState(seedState);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  function sendMessage(conversationId: string, body: string) {
    if (!body.trim()) return;
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const msg: Message = { id: uid("m"), direction: "outbound", body, createdAt: new Date().toISOString() };
        return {
          ...c,
          lastMessagePreview: body,
          updatedAt: new Date().toISOString(),
          messages: [...c.messages, msg]
        };
      })
    }));
  }

  function addNote(conversationId: string, body: string) {
    if (!body.trim()) return;
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const note = { id: uid("n"), body, createdAt: new Date().toISOString() };
        return { ...c, notes: [note, ...c.notes] };
      })
    }));
  }

  function updateStatus(conversationId: string, status: Conversation["status"]) {
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) => c.id === conversationId ? { ...c, status } : c)
    }));
  }

  function injectLead() {
    const names = ["Zanele S.", "Thabo P.", "Ayesha N.", "Gift M.", "Lebo T."];
    const texts = [
      "Hi 👋 can you send your prices?",
      "Do you deliver in my area?",
      "I want a quote please.",
      "Can someone call me back?",
      "How long does shipping take?"
    ];
    const name = names[Math.floor(Math.random() * names.length)];
    const text = texts[Math.floor(Math.random() * texts.length)];
    const contactId = uid("c");
    const convoId = uid("v");
    const phone = "+27 " + Math.floor(60 + Math.random() * 20) + " " + Math.floor(1000000 + Math.random() * 8999999);

    let autoReply: string | null = null;
    const matched = state.rules.find((r) => r.enabled && text.toLowerCase().includes(r.keyword.toLowerCase()));
    if (matched) autoReply = matched.autoReply;

    const contact: Contact = { id: contactId, name, phone, tags: ["lead"] };
    const messages: Conversation["messages"] = [{ id: uid("m"), direction: "inbound", body: text, createdAt: new Date().toISOString() }];
    if (autoReply) {
      messages.push({ id: uid("m"), direction: "outbound", body: autoReply, createdAt: new Date().toISOString() });
    }

    const convo: Conversation = {
      id: convoId,
      contactId,
      status: "open",
      assignedTo: "t2",
      subject: "New lead",
      lastMessagePreview: autoReply ?? text,
      updatedAt: new Date().toISOString(),
      messages,
      notes: []
    };

    setState((prev) => ({
      ...prev,
      contacts: [contact, ...prev.contacts],
      conversations: [convo, ...prev.conversations]
    }));
    setSelectedConversationId(convoId);
  }

  function addRule(keyword: string, autoReply: string) {
    if (!keyword.trim() || !autoReply.trim()) return;
    const rule: Rule = {
      id: uid("r"),
      name: `Keyword: ${keyword}`,
      keyword,
      autoReply,
      enabled: true
    };
    setState((prev) => ({ ...prev, rules: [rule, ...prev.rules] }));
  }

  function addQuote(customer: string, amount: number) {
    if (!customer.trim() || Number.isNaN(amount)) return;
    const quote: Quote = { id: uid("q"), customer, amount, status: "draft" };
    setState((prev) => ({ ...prev, quotes: [quote, ...prev.quotes] }));
  }

  function addProduct(productInput: Omit<Product, "id" | "updatedAt">) {
    if (!productInput.name.trim() || Number.isNaN(productInput.price) || Number.isNaN(productInput.stock)) return;
    const product = normalizeProduct({
      ...productInput,
      id: uid("p"),
      updatedAt: new Date().toISOString(),
    }, state.products.length);
    setState((prev) => ({ ...prev, products: [product, ...prev.products] }));
  }

  function updateProduct(productId: string, updates: Partial<Omit<Product, "id" | "updatedAt">>) {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product, index) =>
        product.id === productId
          ? normalizeProduct({ ...product, ...updates, id: product.id, updatedAt: new Date().toISOString() }, index)
          : product
      ),
    }));
  }

  function removeProduct(productId: string) {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((product) => product.id !== productId),
    }));
  }

  function duplicateProduct(productId: string) {
    const existing = state.products.find((product) => product.id === productId);
    if (!existing) return;
    addProduct({
      ...existing,
      name: `${existing.name} Copy`,
      sku: `${existing.sku}-COPY`,
      featured: false,
    });
  }

  function adjustProductStock(productId: string, delta: number) {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product, index) =>
        product.id === productId
          ? normalizeProduct({
              ...product,
              stock: Math.max(0, product.stock + delta),
              updatedAt: new Date().toISOString(),
            }, index)
          : product
      ),
    }));
  }

  function toggleProductStatus(productId: string) {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product, index) =>
        product.id === productId
          ? normalizeProduct({
              ...product,
              status: product.status === "active" ? "draft" : "active",
              updatedAt: new Date().toISOString(),
            }, index)
          : product
      ),
    }));
  }

  const value = useMemo<Store>(() => ({
    state,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    injectLead,
    addRule,
    addNote,
    updateStatus,
    addQuote,
    addProduct,
    updateProduct,
    removeProduct,
    duplicateProduct,
    adjustProductStock,
    toggleProductStatus,
  }), [state, selectedConversationId]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
