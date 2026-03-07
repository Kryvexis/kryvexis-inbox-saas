"use client";

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
