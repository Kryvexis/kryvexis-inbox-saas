from pathlib import Path
root = Path('/tmp/inboxmeta')

# types
(root/'src/lib/types.ts').write_text('''export type Status = "new" | "open" | "awaiting_customer" | "resolved";
export type Channel = "whatsapp" | "web" | "manual";
export type DeliveryState = "pending" | "sent" | "delivered" | "read" | "failed";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
};

export type Message = {
  id: string;
  direction: "inbound" | "outbound" | "internal";
  body: string;
  createdAt: string;
  channel?: Channel;
  author?: string;
  deliveryState?: DeliveryState;
};

export type Note = {
  id: string;
  body: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  contactId: string;
  status: Status;
  assignedTo?: string;
  subject: string;
  lastMessagePreview: string;
  updatedAt: string;
  messages: Message[];
  notes: Note[];
  channel: Channel;
  unreadCount: number;
  priority: "low" | "medium" | "high";
  labels: string[];
};

export type Rule = {
  id: string;
  name: string;
  keyword: string;
  autoReply: string;
  enabled: boolean;
};

export type Quote = {
  id: string;
  customer: string;
  amount: number;
  status: "draft" | "sent" | "approved";
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: "admin" | "agent";
};

export type MetaConnectionState = {
  configured: boolean;
  webhookConfigured: boolean;
  sendEnabled: boolean;
  mode: "sandbox" | "live";
  phoneNumberId?: string;
  businessAccountId?: string;
  webhookPath: string;
};

export type AppState = {
  contacts: Contact[];
  conversations: Conversation[];
  rules: Rule[];
  quotes: Quote[];
  products: Product[];
  team: TeamMember[];
};
''')

(root/'src/lib/seed.ts').write_text('''import type { AppState } from "./types";

const now = new Date().toISOString();

export const seedState: AppState = {
  contacts: [
    { id: "c1", name: "Sipho M.", phone: "+27 68 628 2874", email: "sipho@example.com", tags: ["lead", "priority"] },
    { id: "c2", name: "Lerato K.", phone: "+27 72 123 0000", email: "lerato@example.com", tags: ["customer"] },
    { id: "c3", name: "Ahmed D.", phone: "+27 61 999 2201", email: "ahmed@example.com", tags: ["lead"] }
  ],
  conversations: [
    {
      id: "v1",
      contactId: "c1",
      status: "open",
      assignedTo: "t2",
      subject: "Pricing request from WhatsApp",
      lastMessagePreview: "Please send your latest pricing.",
      updatedAt: now,
      channel: "whatsapp",
      unreadCount: 1,
      priority: "high",
      labels: ["pricing", "hot lead"],
      messages: [
        { id: "m1", direction: "inbound", body: "Hi 👋 can you send your latest prices?", createdAt: now, channel: "whatsapp", author: "Sipho M." },
        { id: "m2", direction: "outbound", body: "Absolutely. I can send packages and delivery options.", createdAt: now, channel: "whatsapp", author: "Ant", deliveryState: "read" }
      ],
      notes: [
        { id: "n1", body: "High intent. Follow up with quote before close of business.", createdAt: now }
      ]
    },
    {
      id: "v2",
      contactId: "c2",
      status: "awaiting_customer",
      assignedTo: "t3",
      subject: "Invoice resend",
      lastMessagePreview: "I’ve resent the invoice to your email address.",
      updatedAt: now,
      channel: "manual",
      unreadCount: 0,
      priority: "medium",
      labels: ["billing"],
      messages: [
        { id: "m3", direction: "inbound", body: "Please resend my invoice.", createdAt: now, channel: "manual", author: "Lerato K." },
        { id: "m4", direction: "outbound", body: "Done. Please confirm once you receive it.", createdAt: now, channel: "manual", author: "Mpho", deliveryState: "sent" }
      ],
      notes: []
    },
    {
      id: "v3",
      contactId: "c3",
      status: "new",
      assignedTo: "t2",
      subject: "Stock check",
      lastMessagePreview: "Do you still have the Business Package available?",
      updatedAt: now,
      channel: "web",
      unreadCount: 2,
      priority: "low",
      labels: ["website"],
      messages: [
        { id: "m5", direction: "inbound", body: "Do you still have the Business Package available?", createdAt: now, channel: "web", author: "Ahmed D." }
      ],
      notes: []
    }
  ],
  rules: [
    { id: "r1", name: "Pricing auto-reply", keyword: "price", autoReply: "Thanks for reaching out. I can send the latest pricing and package options.", enabled: true },
    { id: "r2", name: "Delivery auto-reply", keyword: "deliver", autoReply: "Yes, delivery is available. Please send your area so I can confirm lead time.", enabled: true }
  ],
  quotes: [
    { id: "q1", customer: "Sipho M.", amount: 2499, status: "sent" },
    { id: "q2", customer: "Ahmed D.", amount: 799, status: "draft" }
  ],
  products: [
    { id: "p1", name: "Starter Package", price: 499, stock: 12 },
    { id: "p2", name: "Business Package", price: 1499, stock: 7 },
    { id: "p3", name: "Enterprise Package", price: 3499, stock: 3 }
  ],
  team: [
    { id: "t1", name: "Ant", role: "admin" },
    { id: "t2", name: "Nomsa", role: "agent" },
    { id: "t3", name: "Mpho", role: "agent" }
  ]
};
''')

(root/'src/lib/meta.ts').write_text('''import type { MetaConnectionState } from "@/lib/types";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v23.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function getMetaConnectionState(): MetaConnectionState {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const businessAccountId = process.env.META_BUSINESS_ACCOUNT_ID;
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  return {
    configured: Boolean(accessToken && phoneNumberId),
    webhookConfigured: Boolean(verifyToken),
    sendEnabled: Boolean(accessToken && phoneNumberId),
    mode: (process.env.META_MODE === "live" ? "live" : "sandbox"),
    phoneNumberId,
    businessAccountId,
    webhookPath: "/api/meta/webhook",
  };
}

export function getMetaWebhookVerifyToken() {
  return process.env.META_WEBHOOK_VERIFY_TOKEN ?? "";
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function sendWhatsAppTextMessage(args: {
  to: string;
  body: string;
  previewUrl?: boolean;
}) {
  const phoneNumberId = getRequiredEnv("META_PHONE_NUMBER_ID");
  const accessToken = getRequiredEnv("META_ACCESS_TOKEN");

  const response = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: args.to,
      type: "text",
      text: {
        preview_url: args.previewUrl ?? false,
        body: args.body,
      },
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || "Meta API request failed";
    throw new Error(message);
  }

  return payload;
}

export function normaliseSouthAfricanNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}
''')

(root/'src/components/StoreProvider.tsx').write_text('''"use client";

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
''')

(root/'src/app/app/inbox/page.tsx').write_text('''"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "open", label: "Open" },
  { value: "awaiting_customer", label: "Awaiting customer" },
  { value: "resolved", label: "Resolved" },
] as const;

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function InboxPage() {
  const { state, selectedConversationId, setSelectedConversationId, sendMessage, addNote, updateStatus } = useStore();
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]["value"]>("all");

  const filteredConversations = useMemo(() => {
    return state.conversations.filter((c) => {
      const contact = state.contacts.find((x) => x.id === c.contactId);
      const matchesSearch = !search.trim() || [contact?.name, c.lastMessagePreview, contact?.phone, c.subject]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, state.contacts, state.conversations, statusFilter]);

  const selected = useMemo(
    () => filteredConversations.find((c) => c.id === selectedConversationId) ?? filteredConversations[0] ?? state.conversations[0],
    [filteredConversations, state.conversations, selectedConversationId]
  );

  const selectedContact = state.contacts.find((c) => c.id === selected?.contactId);
  const queueCounts = useMemo(() => ({
    newCount: state.conversations.filter((c) => c.status === "new").length,
    openCount: state.conversations.filter((c) => c.status === "open").length,
    waitingCount: state.conversations.filter((c) => c.status === "awaiting_customer").length,
  }), [state.conversations]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xl font-semibold">Inbox</div>
          <div className="text-sm text-neutral-500">Manage WhatsApp, web, and manual conversations from one workspace.</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm md:w-[360px]">
          <div className="kx-card2 p-3"><div className="text-neutral-500">New</div><div className="mt-1 text-xl font-semibold">{queueCounts.newCount}</div></div>
          <div className="kx-card2 p-3"><div className="text-neutral-500">Open</div><div className="mt-1 text-xl font-semibold">{queueCounts.openCount}</div></div>
          <div className="kx-card2 p-3"><div className="text-neutral-500">Awaiting</div><div className="mt-1 text-xl font-semibold">{queueCounts.waitingCount}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr_320px]">
        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-3 space-y-3">
            <input
              className="kx-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
            />
            <select className="kx-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="max-h-[72vh] overflow-auto">
            {filteredConversations.map((c) => {
              const contact = state.contacts.find((x) => x.id === c.contactId);
              const active = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedConversationId(c.id)}
                  className={active ? "block w-full border-b border-neutral-100 bg-neutral-50 p-4 text-left" : "block w-full border-b border-neutral-100 p-4 text-left hover:bg-neutral-50"}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate font-medium">{contact?.name ?? "Unknown"}</div>
                    {c.unreadCount > 0 ? <span className="rounded-full bg-black px-2 py-0.5 text-[11px] font-medium text-white">{c.unreadCount}</span> : null}
                  </div>
                  <div className="mt-1 truncate text-xs text-neutral-500">{c.lastMessagePreview}</div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500">
                    <span className="kx-badge">{statusLabel(c.status)}</span>
                    <span className="kx-badge">{c.channel}</span>
                    <span className="kx-badge">{c.priority}</span>
                  </div>
                </button>
              );
            })}
            {!filteredConversations.length ? <div className="p-4 text-sm text-neutral-500">No conversations match the current filter.</div> : null}
          </div>
        </div>

        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{selectedContact?.name ?? "Select conversation"}</div>
              <div className="text-xs text-neutral-500">{selectedContact?.phone} · {selected?.channel ?? "channel"}</div>
            </div>
            {selected ? (
              <select
                className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value as typeof selected.status)}
              >
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="awaiting_customer">Awaiting customer</option>
                <option value="resolved">Resolved</option>
              </select>
            ) : null}
          </div>

          <div className="max-h-[58vh] overflow-auto p-4 space-y-3">
            {selected?.messages.map((m) => (
              <div
                key={m.id}
                className={m.direction === "outbound"
                  ? "ml-auto max-w-[80%] rounded-2xl border border-black bg-black p-3 text-sm text-white"
                  : m.direction === "internal"
                    ? "max-w-[85%] rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm"
                    : "max-w-[80%] rounded-2xl border border-neutral-200 bg-white p-3 text-sm"}
              >
                <div>{m.body}</div>
                <div className={m.direction === "outbound" ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-neutral-500"}>
                  {m.author ?? m.direction} · {new Date(m.createdAt).toLocaleString()}
                  {m.deliveryState ? ` · ${m.deliveryState}` : ""}
                </div>
              </div>
            ))}
          </div>

          {selected ? (
            <div className="border-t border-neutral-200 p-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                {["Thanks, I’m on it.", "I’ll send the quote shortly.", "Please confirm your delivery area."].map((quick) => (
                  <button key={quick} className="kx-badge" onClick={() => setBody(quick)}>{quick}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="kx-input"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={selected.channel === "whatsapp" ? "Reply to WhatsApp conversation" : "Write a reply"}
                />
                <button
                  className="kx-btn kx-btn-primary"
                  onClick={() => {
                    sendMessage(selected.id, body);
                    setBody("");
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="kx-card2 p-4">
            <div className="text-sm font-medium">Customer details</div>
            <div className="mt-3 text-sm">
              <div><span className="text-neutral-500">Name:</span> {selectedContact?.name ?? "—"}</div>
              <div className="mt-1"><span className="text-neutral-500">Phone:</span> {selectedContact?.phone ?? "—"}</div>
              <div className="mt-1"><span className="text-neutral-500">Email:</span> {selectedContact?.email ?? "—"}</div>
              <div className="mt-1"><span className="text-neutral-500">Priority:</span> {selected?.priority ?? "—"}</div>
              <div className="mt-1"><span className="text-neutral-500">Labels:</span> {selected?.labels.join(", ") || "—"}</div>
            </div>
          </div>

          <div className="kx-card2 p-4">
            <div className="text-sm font-medium">Connection context</div>
            <div className="mt-3 text-sm text-neutral-600 space-y-1">
              <div>Channel: <b>{selected?.channel ?? "—"}</b></div>
              <div>Assigned to: <b>{selected?.assignedTo ?? "Unassigned"}</b></div>
              <div>Latest activity: <b>{selected ? new Date(selected.updatedAt).toLocaleString() : "—"}</b></div>
            </div>
          </div>

          <div className="kx-card2 p-4">
            <div className="text-sm font-medium">Internal notes</div>
            <div className="mt-3 space-y-2">
              {selected?.notes.map((n) => (
                <div key={n.id} className="rounded-2xl border border-neutral-200 p-3 text-sm">
                  <div>{n.body}</div>
                  <div className="mt-1 text-xs text-neutral-500">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            {selected ? (
              <div className="mt-3 flex gap-2">
                <input className="kx-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" />
                <button
                  className="kx-btn kx-btn-ghost border border-neutral-200"
                  onClick={() => {
                    addNote(selected.id, note);
                    setNote("");
                  }}
                >
                  Add
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
''')

(root/'src/app/app/settings/page.tsx').write_text('''import { getMetaConnectionState } from "@/lib/meta";
import { useStore } from "@/components/StoreProvider";

export default function SettingsPage() {
  const meta = getMetaConnectionState();
  return <SettingsInner meta={meta} />;
}

function SettingsInner({ meta }: { meta: ReturnType<typeof getMetaConnectionState> }) {
  const { state } = useStore();

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-neutral-500">Workspace details, team overview, and Meta API connection status.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-3 text-sm text-neutral-600">
            <div>Name: <b>Kryvexis Inbox System</b></div>
            <div className="mt-1">Mode: <b>{meta.mode === "live" ? "Live connection" : "Meta-ready workspace"}</b></div>
            <div className="mt-1">Messaging: <b>{meta.sendEnabled ? "Ready to send via Meta" : "Waiting for Meta credentials"}</b></div>
          </div>
        </div>

        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Team</div>
          <div className="mt-3 space-y-2">
            {state.team.map((m) => (
              <div key={m.id} className="rounded-2xl border border-neutral-200 p-3 text-sm">
                <div className="font-medium">{m.name}</div>
                <div className="text-neutral-500">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Meta API connection</div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Access token</span><span className="kx-badge">{meta.configured ? "Detected" : "Missing"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Phone number ID</span><span className="kx-badge">{meta.phoneNumberId ? meta.phoneNumberId : "Missing"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Business account ID</span><span className="kx-badge">{meta.businessAccountId ? meta.businessAccountId : "Optional"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Webhook verify token</span><span className="kx-badge">{meta.webhookConfigured ? "Configured" : "Missing"}</span></div>
            <div className="rounded-2xl border border-neutral-200 p-3 text-neutral-600">
              Webhook path: <b>{meta.webhookPath}</b>
            </div>
          </div>
        </div>

        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Connection checklist</div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-600">
            <li>Add Meta credentials to your Vercel environment variables.</li>
            <li>Set the webhook callback to <b>{meta.webhookPath}</b>.</li>
            <li>Use the same verify token in Meta and Vercel.</li>
            <li>Redeploy after saving your environment variables.</li>
            <li>Test inbound and outbound WhatsApp messaging.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
''')

# app shell/home wording
(root/'src/components/AppShell.tsx').write_text((root/'src/components/AppShell.tsx').read_text().replace('Demo-ready','Meta-ready').replace('Inject demo lead','Add sample lead').replace('Kryvexis Inbox','Kryvexis Inbox System'))
(root/'src/app/page.tsx').write_text('''import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="kx-shell">
      <div className="kx-container py-10">
        <header className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/app/inbox" className="kx-btn kx-btn-primary">Open workspace</Link>
          </div>
        </header>

        <section className="mt-16 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">
              Kryvexis Inbox System
            </h1>
            <p className="mt-5 text-lg text-neutral-600">
              A centralized workspace for customer conversations, quotes, products, and team follow-up, now prepared for live Meta WhatsApp messaging.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/inbox" className="kx-btn kx-btn-primary px-5 py-3">Launch workspace</Link>
              <span className="kx-badge">Meta-ready integration layer</span>
            </div>
          </div>

          <div className="kx-card p-6">
            <div className="kx-card2 p-5">
              <div className="text-sm font-semibold">Today</div>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="font-medium">New WhatsApp lead</div>
                  <div className="text-sm text-neutral-600">A customer asked for pricing and delivery options.</div>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="font-medium">Workflow executed</div>
                  <div className="text-sm text-neutral-600">Pricing keyword triggered the prepared reply flow.</div>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="font-medium">Quote delivered</div>
                  <div className="text-sm text-neutral-600">A proposal is ready to follow the conversation through to close.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
''')

(root/'src/app/api/meta/webhook').mkdir(parents=True, exist_ok=True)
(root/'src/app/api/meta/send').mkdir(parents=True, exist_ok=True)
(root/'src/app/api/meta/status').mkdir(parents=True, exist_ok=True)
(root/'src/app/api/meta/webhook/route.ts').write_text('''import { NextRequest, NextResponse } from "next/server";
import { getMetaWebhookVerifyToken } from "@/lib/meta";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const mode = search.get("hub.mode");
  const token = search.get("hub.verify_token");
  const challenge = search.get("hub.challenge");

  if (mode === "subscribe" && token === getMetaWebhookVerifyToken()) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  console.log("[meta-webhook] inbound payload", JSON.stringify(body));
  return NextResponse.json({ received: true });
}
''')
(root/'src/app/api/meta/send/route.ts').write_text('''import { NextRequest, NextResponse } from "next/server";
import { normaliseSouthAfricanNumber, sendWhatsAppTextMessage } from "@/lib/meta";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as { to?: string; body?: string } | null;

  if (!payload?.to || !payload?.body) {
    return NextResponse.json({ error: "Missing to or body" }, { status: 400 });
  }

  try {
    const response = await sendWhatsAppTextMessage({
      to: normaliseSouthAfricanNumber(payload.to),
      body: payload.body,
    });

    return NextResponse.json({ ok: true, response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Meta send error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
''')
(root/'src/app/api/meta/status/route.ts').write_text('''import { NextResponse } from "next/server";
import { getMetaConnectionState } from "@/lib/meta";

export async function GET() {
  return NextResponse.json(getMetaConnectionState());
}
''')

# env example
(root/'.env.example').write_text((root/'.env.example').read_text() + '\n\n# Meta WhatsApp Cloud API\nMETA_MODE=sandbox\nMETA_GRAPH_VERSION=v23.0\nMETA_ACCESS_TOKEN=\nMETA_PHONE_NUMBER_ID=\nMETA_BUSINESS_ACCOUNT_ID=\nMETA_WEBHOOK_VERIFY_TOKEN=\n')

# README append
(root/'README.md').write_text((root/'README.md').read_text() + '''\n\n## Meta WhatsApp integration\n\nThis project now includes a Meta-ready integration layer:\n\n- `GET /api/meta/webhook` for webhook verification\n- `POST /api/meta/webhook` for inbound webhook payloads\n- `POST /api/meta/send` to send a WhatsApp text message\n- `GET /api/meta/status` to inspect whether credentials are configured\n\n### Required environment variables\n\n- `META_MODE` (`sandbox` or `live`)\n- `META_GRAPH_VERSION`\n- `META_ACCESS_TOKEN`\n- `META_PHONE_NUMBER_ID`\n- `META_BUSINESS_ACCOUNT_ID` (optional)\n- `META_WEBHOOK_VERIFY_TOKEN`\n''')
