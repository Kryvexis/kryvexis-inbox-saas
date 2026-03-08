"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { seedState } from "@/lib/seed";
import type {
  AppState,
  Contact,
  Conversation,
  CreateConversationInput,
  Message,
  MetaInboundRecord,
  Product,
  Quote,
  Rule,
  SendMessageResult,
} from "@/lib/types";

type Store = {
  state: AppState;
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, body: string) => Promise<SendMessageResult>;
  createConversation: (input: CreateConversationInput) => Promise<{ ok: true; conversationId: string } | { ok: false; error: string }>;
  injectLead: () => void;
  addRule: (keyword: string, autoReply: string) => void;
  addNote: (conversationId: string, body: string) => void;
  updateStatus: (conversationId: string, status: Conversation["status"]) => void;
  addQuote: (customer: string, amount: number) => void;
  addProduct: (name: string, price: number, stock: number) => void;
};

const StoreContext = createContext<Store | null>(null);
const KEY = "kryvexis_showcase_state_v2";

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function normalisePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]) {
  const map = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) {
    const existing = map.get(item.id);
    map.set(item.id, existing ? { ...existing, ...item } : item);
  }
  return Array.from(map.values());
}

function mergeServerState(prev: AppState, payload: Partial<AppState>): AppState {
  const contacts = mergeById(prev.contacts, payload.contacts ?? []);
  const incomingConversations = payload.conversations ?? [];
  const mergedConversations = [...prev.conversations];

  for (const incoming of incomingConversations) {
    const index = mergedConversations.findIndex((c) => c.id === incoming.id);
    if (index >= 0) {
      const existing = mergedConversations[index];
      mergedConversations[index] = {
        ...existing,
        ...incoming,
        notes: mergeById(existing.notes, incoming.notes ?? []),
        messages: mergeById(existing.messages, incoming.messages ?? []).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      };
    } else {
      mergedConversations.push(incoming);
    }
  }

  mergedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return {
    ...prev,
    contacts,
    conversations: mergedConversations,
  };
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
      provider: "meta",
      author: item.contact_name?.trim() || contact.name,
      remoteMessageId: item.wamid,
    };

    if (existingConversation) {
      if (existingConversation.messages.some((m) => m.id === inboundMessage.id || (item.wamid && m.remoteMessageId === item.wamid))) continue;
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
      subject: `WhatsApp conversation · ${subjectName}`,
      lastMessagePreview: item.body,
      updatedAt: item.received_at,
      messages: [inboundMessage],
      notes: [],
      channel: "whatsapp",
      provider: "meta",
      unreadCount: 1,
      priority: "medium",
      labels: ["whatsapp", "live inbound"],
      persisted: false,
    };
    conversations = [newConversation, ...conversations];
  }

  conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return { ...prev, contacts, conversations };
}

async function fetchJson(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
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

    async function bootstrapNative() {
      try {
        const { response, payload } = await fetchJson("/api/inbox/native/bootstrap", { cache: "no-store" });
        if (!response.ok || !payload?.ok || cancelled) return;
        setState((prev) => mergeServerState(prev, payload.state as Partial<AppState>));
      } catch {}
    }

    bootstrapNative();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncIncoming() {
      try {
        const { response, payload } = await fetchJson("/api/meta/incoming", { cache: "no-store" });
        if (!response.ok) return;
        const incoming = Array.isArray(payload?.messages) ? payload.messages as MetaInboundRecord[] : [];
        if (!incoming.length || cancelled) return;

        setState((prev) => mergeIncomingMessages(prev, incoming));
        const ids = incoming.map((item) => item.id).filter(Boolean);
        if (ids.length) {
          await fetch("/api/meta/incoming/ack", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          });
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

  async function sendMessage(conversationId: string, body: string): Promise<SendMessageResult> {
    const trimmed = body.trim();
    if (!trimmed) {
      return { ok: false, conversationId, provider: "none", error: "Message body is empty" };
    }

    const conversation = state.conversations.find((c) => c.id === conversationId);
    const contact = conversation ? state.contacts.find((c) => c.id === conversation.contactId) : undefined;
    if (!conversation) {
      return { ok: false, conversationId, provider: "none", error: "Conversation not found" };
    }

    const messageId = uid("m");
    const createdAt = new Date().toISOString();
    const provider = conversation.provider;
    const isMetaWhatsApp = provider === "meta" && conversation.channel === "whatsapp" && !!contact?.phone;

    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((c) => {
        if (c.id !== conversationId) return c;
        const msg: Message = {
          id: messageId,
          direction: "outbound",
          body: trimmed,
          createdAt,
          channel: c.channel,
          provider: c.provider,
          author: "Agent",
          deliveryState: isMetaWhatsApp ? "pending" : "queued",
        };
        return {
          ...c,
          lastMessagePreview: trimmed,
          updatedAt: createdAt,
          status: c.status === "new" ? "open" : c.status,
          messages: [...c.messages, msg],
        };
      }),
    }));

    if (isMetaWhatsApp && contact?.phone) {
      try {
        const { response, payload } = await fetchJson("/api/meta/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            messageId,
            to: contact.phone,
            body: trimmed,
          }),
        });

        if (!response.ok || !payload?.ok) {
          const errorText = typeof payload?.error === "string" ? payload.error : "Meta send failed";
          throw new Error(errorText);
        }

        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            return {
              ...c,
              messages: c.messages.map((m) => m.id === messageId ? {
                ...m,
                deliveryState: "sent",
                remoteMessageId: typeof payload?.remoteMessageId === "string" ? payload.remoteMessageId : m.remoteMessageId,
              } : m),
            };
          }),
        }));

        return {
          ok: true,
          conversationId,
          localMessageId: messageId,
          remoteMessageId: typeof payload?.remoteMessageId === "string" ? payload.remoteMessageId : undefined,
          provider: "meta",
        };
      } catch (error) {
        const failureText = error instanceof Error ? error.message : "Meta send failed";
        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.map((c) => {
            if (c.id !== conversationId) return c;
            const note = {
              id: uid("n"),
              body: `WhatsApp send failed: ${failureText}`,
              createdAt: new Date().toISOString(),
            };
            return {
              ...c,
              messages: c.messages.map((m) => m.id === messageId ? { ...m, deliveryState: "failed" } : m),
              notes: [note, ...c.notes],
            };
          }),
        }));

        return { ok: false, conversationId, localMessageId: messageId, provider: "meta", error: failureText };
      }
    }

    try {
      const { response, payload } = await fetchJson("/api/inbox/native/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, body: trimmed, messageId }),
      });

      if (!response.ok || !payload?.ok) {
        const errorText = typeof payload?.error === "string" ? payload.error : "Native send persistence failed";
        throw new Error(errorText);
      }

      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => c.id === conversationId ? {
          ...c,
          persisted: true,
          messages: c.messages.map((m) => m.id === messageId ? { ...m, deliveryState: "sent" } : m),
        } : c),
      }));

      return { ok: true, conversationId, localMessageId: messageId, provider: conversation.provider };
    } catch (error) {
      const failureText = error instanceof Error ? error.message : "Native send persistence failed";
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          const note = {
            id: uid("n"),
            body: `Native persistence fallback: ${failureText}`,
            createdAt: new Date().toISOString(),
          };
          return {
            ...c,
            messages: c.messages.map((m) => m.id === messageId ? { ...m, deliveryState: "sent" } : m),
            notes: [note, ...c.notes],
          };
        }),
      }));

      return { ok: true, conversationId, localMessageId: messageId, provider: conversation.provider };
    }
  }

  async function createConversation(input: CreateConversationInput) {
    const name = input.name.trim();
    const phone = input.phone.trim();
    const subject = input.subject.trim();
    const initialBody = input.message.trim();
    const email = input.email?.trim();

    if (!name || !subject || !initialBody) {
      return { ok: false as const, error: "Name, subject, and initial message are required" };
    }

    const contactId = uid("c");
    const conversationId = uid("v");
    const messageId = uid("m");
    const createdAt = new Date().toISOString();
    const provider = "native" as const;

    const contact: Contact = {
      id: contactId,
      name,
      phone: phone || "—",
      email: email || undefined,
      tags: [input.channel, "native"],
    };

    const conversation: Conversation = {
      id: conversationId,
      contactId,
      status: "new",
      subject,
      lastMessagePreview: initialBody,
      updatedAt: createdAt,
      messages: [{
        id: messageId,
        direction: "inbound",
        body: initialBody,
        createdAt,
        channel: input.channel,
        provider,
        author: name,
      }],
      notes: [],
      channel: input.channel,
      provider,
      unreadCount: 1,
      priority: input.channel === "manual" ? "medium" : "low",
      labels: [input.channel, "native"],
      persisted: false,
    };

    setState((prev) => ({
      ...prev,
      contacts: [contact, ...prev.contacts],
      conversations: [conversation, ...prev.conversations],
    }));
    setSelectedConversationId(conversationId);

    try {
      const { response, payload } = await fetchJson("/api/inbox/native/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact,
          conversation: {
            id: conversationId,
            subject,
            status: "new",
            lastMessagePreview: initialBody,
            updatedAt: createdAt,
            channel: input.channel,
            priority: conversation.priority,
            labels: conversation.labels,
          },
          initialMessage: {
            id: messageId,
            body: initialBody,
            direction: "inbound",
            createdAt,
          },
        }),
      });

      if (!response.ok || !payload?.ok) {
        const errorText = typeof payload?.error === "string" ? payload.error : "Native conversation persistence failed";
        throw new Error(errorText);
      }

      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => c.id === conversationId ? { ...c, persisted: true } : c),
      }));

      return { ok: true as const, conversationId };
    } catch (error) {
      const failureText = error instanceof Error ? error.message : "Native conversation persistence failed";
      setState((prev) => ({
        ...prev,
        conversations: prev.conversations.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            notes: [{ id: uid("n"), body: `Native persistence fallback: ${failureText}`, createdAt: new Date().toISOString() }, ...c.notes],
          };
        }),
      }));

      return { ok: true as const, conversationId };
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
    const messages: Conversation["messages"] = [{ id: uid("m"), direction: "inbound", body: text, createdAt: new Date().toISOString(), channel: "whatsapp", provider: "meta", author: name }];
    if (autoReply) {
      messages.push({ id: uid("m"), direction: "outbound", body: autoReply, createdAt: new Date().toISOString(), channel: "whatsapp", provider: "meta", author: "Agent", deliveryState: "sent" });
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
      provider: "meta",
      unreadCount: 1,
      priority: "medium",
      labels: ["new lead", "meta"],
      persisted: false,
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
    createConversation,
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
