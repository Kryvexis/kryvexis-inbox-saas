"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedState } from "@/lib/seed";
import type {
  AppState,
  Contact,
  Conversation,
  Message,
  Product,
  ProductStatus,
  Quote,
  QuoteItem,
  QuoteStatus,
  Rule,
  RuleChannel,
  RuleMatchType,
} from "@/lib/types";

type ProductInput = Omit<Product, "id" | "updatedAt">;
type QuoteInput = {
  customer: string;
  contactId?: string;
  conversationId?: string;
  items: Array<Omit<QuoteItem, "id">>;
  discount?: number;
  status?: QuoteStatus;
  notes?: string;
  validUntil?: string;
};
type RuleInput = {
  name: string;
  keyword: string;
  autoReply: string;
  matchType: RuleMatchType;
  channel: RuleChannel;
};

type Store = {
  state: AppState;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, body: string) => void;
  injectLead: () => void;
  addRule: (input: RuleInput) => void;
  toggleRule: (ruleId: string) => void;
  duplicateRule: (ruleId: string) => void;
  removeRule: (ruleId: string) => void;
  triggerRuleSample: (ruleId: string) => void;
  addNote: (conversationId: string, body: string) => void;
  updateStatus: (conversationId: string, status: Conversation["status"]) => void;
  addQuote: (input: QuoteInput) => string | null;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus) => void;
  duplicateQuote: (quoteId: string) => void;
  removeQuote: (quoteId: string) => void;
  createQuoteFromConversation: (conversationId: string) => string | null;
  addProduct: (product: ProductInput) => void;
  updateProduct: (productId: string, updates: Partial<ProductInput>) => void;
  removeProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => void;
  adjustProductStock: (productId: string, delta: number) => void;
  toggleProductStatus: (productId: string) => void;
};

const StoreContext = createContext<Store | null>(null);
const KEY = "kryvexis_showcase_state_v3";

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

function quoteTotals(items: QuoteItem[], discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const safeDiscount = Math.max(0, discount);
  return {
    subtotal,
    discount: safeDiscount,
    total: Math.max(0, subtotal - safeDiscount),
  };
}

function normalizeQuote(input: Partial<Quote>, index: number): Quote {
  const items = Array.isArray(input.items) && input.items.length
    ? input.items.map((item, itemIndex) => ({
        id: item.id || uid("qi"),
        productId: item.productId,
        name: item.name || `Item ${itemIndex + 1}`,
        quantity: typeof item.quantity === "number" && Number.isFinite(item.quantity) ? Math.max(1, item.quantity) : 1,
        unitPrice: typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
      }))
    : [{ id: uid("qi"), name: "Custom item", quantity: 1, unitPrice: typeof input.amount === "number" ? input.amount : 0 }];
  const totals = quoteTotals(items, typeof input.discount === "number" ? input.discount : 0);
  return {
    id: input.id || uid("q"),
    customer: input.customer?.trim() || `Customer ${index + 1}`,
    contactId: input.contactId,
    conversationId: input.conversationId,
    status: input.status === "sent" || input.status === "accepted" || input.status === "rejected" ? input.status : "draft",
    items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    total: typeof input.total === "number" && Number.isFinite(input.total) ? input.total : totals.total,
    amount: typeof input.amount === "number" && Number.isFinite(input.amount) ? input.amount : totals.total,
    validUntil: input.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
    notes: input.notes || "",
  };
}

function normalizeRule(input: Partial<Rule>, index: number): Rule {
  const keyword = input.keyword?.trim() || `rule-${index + 1}`;
  return {
    id: input.id || uid("r"),
    name: input.name?.trim() || `Keyword: ${keyword}`,
    keyword,
    autoReply: input.autoReply?.trim() || "Thanks — we received your message.",
    enabled: input.enabled ?? true,
    matchType: input.matchType === "exact" || input.matchType === "startsWith" ? input.matchType : "contains",
    channel: input.channel === "quotes" || input.channel === "both" ? input.channel : "inbox",
    usageCount: typeof input.usageCount === "number" && Number.isFinite(input.usageCount) ? input.usageCount : 0,
    lastTriggeredAt: input.lastTriggeredAt,
  };
}

function normalizeState(input: AppState): AppState {
  return {
    ...input,
    products: (input.products ?? []).map((product, index) => normalizeProduct(product, index)),
    quotes: (input.quotes ?? []).map((quote, index) => normalizeQuote(quote, index)),
    rules: (input.rules ?? []).map((rule, index) => normalizeRule(rule, index)),
  };
}

function textMatchesRule(text: string, rule: Rule) {
  const hay = text.toLowerCase();
  const needle = rule.keyword.toLowerCase();
  if (rule.matchType === "exact") return hay.trim() === needle;
  if (rule.matchType === "startsWith") return hay.trim().startsWith(needle);
  return hay.includes(needle);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(seedState.conversations[0]?.id ?? null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem("kryvexis_showcase_state_v2") ?? localStorage.getItem("kryvexis_showcase_state_v1");
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
    const matched = state.rules.find((r) => r.enabled && (r.channel === "inbox" || r.channel === "both") && textMatchesRule(text, r));
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
      conversations: [convo, ...prev.conversations],
      rules: matched ? prev.rules.map((rule) => rule.id === matched.id ? { ...rule, usageCount: rule.usageCount + 1, lastTriggeredAt: new Date().toISOString() } : rule) : prev.rules,
    }));
    setSelectedConversationId(convoId);
  }

  function addRule(input: RuleInput) {
    if (!input.keyword.trim() || !input.autoReply.trim() || !input.name.trim()) return;
    const rule: Rule = {
      id: uid("r"),
      name: input.name.trim(),
      keyword: input.keyword.trim(),
      autoReply: input.autoReply.trim(),
      enabled: true,
      matchType: input.matchType,
      channel: input.channel,
      usageCount: 0,
    };
    setState((prev) => ({ ...prev, rules: [rule, ...prev.rules] }));
  }

  function toggleRule(ruleId: string) {
    setState((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule),
    }));
  }

  function duplicateRule(ruleId: string) {
    setState((prev) => {
      const rule = prev.rules.find((item) => item.id === ruleId);
      if (!rule) return prev;
      const clone: Rule = {
        ...rule,
        id: uid("r"),
        name: `${rule.name} Copy`,
        usageCount: 0,
        lastTriggeredAt: undefined,
      };
      return { ...prev, rules: [clone, ...prev.rules] };
    });
  }

  function removeRule(ruleId: string) {
    setState((prev) => ({ ...prev, rules: prev.rules.filter((rule) => rule.id !== ruleId) }));
  }

  function triggerRuleSample(ruleId: string) {
    setState((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => rule.id === ruleId ? { ...rule, usageCount: rule.usageCount + 1, lastTriggeredAt: new Date().toISOString() } : rule),
    }));
  }

  function addQuote(input: QuoteInput) {
    const customer = input.customer.trim();
    const validItems = input.items
      .filter((item) => item.name.trim() && Number.isFinite(item.quantity) && Number.isFinite(item.unitPrice))
      .map((item) => ({
        id: uid("qi"),
        productId: item.productId,
        name: item.name.trim(),
        quantity: Math.max(1, item.quantity),
        unitPrice: Math.max(0, item.unitPrice),
      }));

    if (!customer || !validItems.length) return null;
    const totals = quoteTotals(validItems, input.discount ?? 0);
    const quote: Quote = {
      id: uid("q"),
      customer,
      contactId: input.contactId,
      conversationId: input.conversationId,
      status: input.status ?? "draft",
      items: validItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      amount: totals.total,
      validUntil: input.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      notes: input.notes?.trim() || "",
    };
    setState((prev) => ({ ...prev, quotes: [quote, ...prev.quotes] }));
    return quote.id;
  }

  function updateQuoteStatus(quoteId: string, status: QuoteStatus) {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.map((quote) => quote.id === quoteId ? { ...quote, status, updatedAt: new Date().toISOString() } : quote),
    }));
  }

  function duplicateQuote(quoteId: string) {
    setState((prev) => {
      const quote = prev.quotes.find((item) => item.id === quoteId);
      if (!quote) return prev;
      const clone: Quote = {
        ...quote,
        id: uid("q"),
        status: "draft",
        updatedAt: new Date().toISOString(),
        items: quote.items.map((item) => ({ ...item, id: uid("qi") })),
      };
      return { ...prev, quotes: [clone, ...prev.quotes] };
    });
  }

  function removeQuote(quoteId: string) {
    setState((prev) => ({ ...prev, quotes: prev.quotes.filter((quote) => quote.id !== quoteId) }));
  }

  function createQuoteFromConversation(conversationId: string) {
    const conversation = state.conversations.find((item) => item.id === conversationId);
    if (!conversation) return null;
    const customer = state.contacts.find((contact) => contact.id === conversation.contactId)?.name || "New customer";
    const firstProduct = state.products.find((product) => product.status === "active") || state.products[0];
    if (!firstProduct) return null;
    return addQuote({
      customer,
      contactId: conversation.contactId,
      conversationId,
      items: [{ productId: firstProduct.id, name: firstProduct.name, quantity: 1, unitPrice: firstProduct.price }],
      notes: `Created from conversation: ${conversation.subject}`,
      status: "draft",
    });
  }

  function addProduct(product: ProductInput) {
    if (!product.name.trim()) return;
    const record = normalizeProduct({ ...product, id: uid("p"), updatedAt: new Date().toISOString() }, state.products.length);
    setState((prev) => ({ ...prev, products: [record, ...prev.products] }));
  }

  function updateProduct(productId: string, updates: Partial<ProductInput>) {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product, index) => product.id === productId
        ? normalizeProduct({ ...product, ...updates, id: product.id, updatedAt: new Date().toISOString() }, index)
        : product),
    }));
  }

  function removeProduct(productId: string) {
    setState((prev) => ({ ...prev, products: prev.products.filter((product) => product.id !== productId) }));
  }

  function duplicateProduct(productId: string) {
    setState((prev) => {
      const product = prev.products.find((item) => item.id === productId);
      if (!product) return prev;
      const clone = normalizeProduct({
        ...product,
        id: uid("p"),
        name: `${product.name} Copy`,
        sku: `${product.sku}-COPY`,
        featured: false,
        updatedAt: new Date().toISOString(),
      }, prev.products.length);
      return { ...prev, products: [clone, ...prev.products] };
    });
  }

  function adjustProductStock(productId: string, delta: number) {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product) => product.id === productId
        ? { ...product, stock: Math.max(0, product.stock + delta), updatedAt: new Date().toISOString() }
        : product),
    }));
  }

  function toggleProductStatus(productId: string) {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product) => product.id === productId
        ? { ...product, status: (product.status === "active" ? "draft" : "active") as ProductStatus, updatedAt: new Date().toISOString() }
        : product),
    }));
  }

  const value = useMemo<Store>(() => ({
    state,
    selectedConversationId,
    setSelectedConversationId,
    sendMessage,
    injectLead,
    addRule,
    toggleRule,
    duplicateRule,
    removeRule,
    triggerRuleSample,
    addNote,
    updateStatus,
    addQuote,
    updateQuoteStatus,
    duplicateQuote,
    removeQuote,
    createQuoteFromConversation,
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
