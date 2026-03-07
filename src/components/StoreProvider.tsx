"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedState } from "@/lib/seed";
import type { AppState, Conversation, Rule, Contact, Quote, Product, Message, MetaInboundRecord } from "@/lib/types";

type Store = {
  state: AppState;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, body: string) => Promise<void>;
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

function normalisePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}

function mergeIncomingMessages(prev: AppState, incoming: MetaInboundRecord[]): AppState {
  if (!incoming.length) return prev;

  let contacts = [...prev.contacts];
  let conversations = [...prev.conversations];

  for (const item of incoming) {
    const phone = normalisePhone(item.phone);
    let contact = contacts.find((c) => normalisePhone(c.phone) === phone);
    if (!contact) {
      contact = {
        id: uid("c"),
        name: item.contact_name?.trim() || phone,
        phone: phone.startsWith("27") ? `+${phone}` : item.phone,
        tags: ["whatsapp"],
      };
      contacts = [contact, ...contacts];
    }

    const existingConversation = conversations.find((c) => c.contactId === contact!.id && c.channel === "whatsapp");
    const inboundMessage: Message = {
      id: item.wamid || uid("m"),
      direction: "inbound",
      body: item.body,
      createdAt: item.received_at,
      channel: "whatsapp",
      author: item.contact_name?.trim() || contact.name,
    };

    if (existingConversation) {
      if (existingConversation.messages.some((m) => m.id === inboundMessage.id)) continue;
      conversations = conversations.map((c) => c.id === existingConversation.id ? {
        ...c,
        status: c.status === "resolved" ? "open" : c.status === "awaiting_customer" ? "open" : c.status,
        updatedAt: item.received_at,
        lastMessagePreview: item.body,
        unreadCount: c.unreadCount + 1,
        messages: [...c.messages, inboundMessage],
      } : c);
      continue;
    }

    const subjectName = item.contact_name?.trim() || contact.name;
    const newConversation: Conversation = {
      id: uid("v"),
      contactId: contact.id,
      status: "new",
      assignedTo: undefined,
      subject: `WhatsApp conversation · ${subjectName}` ,
      lastMessagePreview: item.body,
      updatedAt: item.received_at,
      messages: [inboundMessage],
      notes: [],
      channel: "whatsapp",
      unreadCount: 1,
      priority: "medium",
      labels: ["whatsapp", "live inbound"],
    };
    conversations = [newConversation, ...conversations];
  }

  conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return { ...prev, contacts, conversations };
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
  useEffect(() => {
    let cancelled = false;

    async function syncIncoming() {
      try {
        const response = await fetch("/api/meta/incoming", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        const incoming = Array.isArray(payload?.messages) ? payload.messages as MetaInboundRecord[] : [];
        if (!incoming.length || cancelled) return;

        setState((prev) => mergeIncomingMessages(prev, incoming));
        if (incoming.length) {
          const ids = incoming.map((item) => item.id).filter(Boolean);
          if (ids.length) {
            await fetch("/api/meta/incoming/ack", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids }),
            });
          }
        }
      } catch {}
    }

    syncIncoming();
    const interval = window.setInterval(syncIncoming, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  async function sendMessage(conversationId: string, body: string) {
    const trimmed = body.trim();
    if (!trimmed) return;

    const messageId = uid("m");
    const createdAt = new Date().toISOString();
    let targetPhone: string | null = null;
    let targetChannel: Conversation["channel"] | null = null;

    setState((prev) => {
      const conversation = prev.conversations.find((c) => c.id === conversationId) ?? null;
      const contact = conversation ? prev.contacts.find((c) => c.id === conversation.contactId) ?? null : null;
      targetPhone = contact?.phone ?? null;
      targetChannel = conversation?.channel ?? null;

      return {
        ...prev,
        conversations: prev.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          const msg: Message = {
            id: messageId,
            direction: "outbound",
            body: trimmed,
            createdAt,
            channel: c.channel,
            author: "Agent",
            deliveryState: c.channel === "whatsapp" ? "pending" : undefined,
          };
          return {
            ...c,
            lastMessagePreview: trimmed,
            updatedAt: createdAt,
            status: c.status === "new" ? "open" : c.status,
            messages: [...c.messages, msg]
          };
        })
      };
    });

    if (targetChannel !== "whatsapp" || !targetPhone) {
      return;
    }

    try {
      const response = await fetch("/api/meta/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: targetPhone, body: trimmed }),
      });

      const payload = await response.json().catch(() => null);
      const deliveryState: Message["deliveryState"] = response.ok ? "sent" : "failed";
      const failureNote = !response.ok
        ? (typeof payload?.error === "string" ? payload.error : "WhatsApp send failed")
        : null;

      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => m.id === messageId ? { ...m, deliveryState } : m),
            notes: failureNote
              ? [{ id: uid("n"), body: `WhatsApp send failed: ${failureNote}`, createdAt: new Date().toISOString() }, ...c.notes]
              : c.notes,
          };
        })
      }));
    } catch (error) {
      const failureMessage = error instanceof Error ? error.message : "Unexpected WhatsApp send error";
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: c.messages.map((m) => m.id === messageId ? { ...m, deliveryState: "failed" } : m),
            notes: [{ id: uid("n"), body: `WhatsApp send failed: ${failureMessage}`, createdAt: new Date().toISOString() }, ...c.notes],
          };
        })
      }));
    }
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
