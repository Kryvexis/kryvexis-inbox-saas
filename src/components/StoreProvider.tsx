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
  addProduct: (name: string, price: number, stock: number) => void;
};

const StoreContext = createContext<Store | null>(null);
const KEY = "kryvexis_showcase_state_v1";

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(seedState.conversations[0]?.id ?? null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        setState(parsed);
        setSelectedConversationId(parsed.conversations[0]?.id ?? null);
      }
    } catch {}
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
        const msg: Message = {
          id: uid("m"),
          direction: "outbound",
          body,
          createdAt: new Date().toISOString(),
          channel: c.channel,
          author: "Agent",
          deliveryState: c.channel === "whatsapp" ? "sent" : undefined,
        };
        return {
          ...c,
          lastMessagePreview: body,
          updatedAt: new Date().toISOString(),
          status: c.status === "new" ? "open" : c.status,
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
    const messages: Conversation["messages"] = [{ id: uid("m"), direction: "inbound", body: text, createdAt: new Date().toISOString(), channel: "whatsapp", author: name }];
    if (autoReply) {
      messages.push({ id: uid("m"), direction: "outbound", body: autoReply, createdAt: new Date().toISOString(), channel: "whatsapp", author: "Agent", deliveryState: "sent" });
    }

    const convo: Conversation = {
      id: convoId,
      contactId,
      status: "new",
      assignedTo: "t2",
      subject: "New WhatsApp lead",
      lastMessagePreview: autoReply ?? text,
      updatedAt: new Date().toISOString(),
      messages,
      notes: [],
      channel: "whatsapp",
      unreadCount: 1,
      priority: "medium",
      labels: ["new lead"]
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

  function addProduct(name: string, price: number, stock: number) {
    if (!name.trim() || Number.isNaN(price) || Number.isNaN(stock)) return;
    const product: Product = { id: uid("p"), name, price, stock };
    setState((prev) => ({ ...prev, products: [product, ...prev.products] }));
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
    addProduct
  }), [state, selectedConversationId]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
