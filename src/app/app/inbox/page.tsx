"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";

const statusOptions = ["all", "open", "pending", "closed"] as const;

function statusLabel(status: "open" | "pending" | "closed") {
  if (status === "pending") return "Awaiting customer";
  if (status === "closed") return "Resolved";
  return "Open";
}

export default function InboxPage() {
  const { state, selectedConversationId, setSelectedConversationId, sendMessage, addNote, updateStatus } = useStore();
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");

  const conversations = useMemo(() => {
    return state.conversations.filter((c) => {
      const contact = state.contacts.find((x) => x.id === c.contactId);
      const matchesQuery = !query.trim() || [contact?.name, contact?.phone, c.lastMessagePreview]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, state.contacts, state.conversations, statusFilter]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? conversations[0] ?? state.conversations[0],
    [conversations, selectedConversationId, state.conversations]
  );

  const selectedContact = state.contacts.find((c) => c.id === selected?.contactId);
  const activeCount = state.conversations.filter((c) => c.status !== "closed").length;
  const awaitingCount = state.conversations.filter((c) => c.status === "pending").length;

  return (
    <div className="grid gap-4 md:gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Inbox</div>
          <div className="mt-1 text-sm text-neutral-500">Keep customer conversations focused, clear, and easy to action.</div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <div className="kx-card2 p-3 md:w-36">
            <div className="text-xs text-neutral-500">Active</div>
            <div className="mt-1 text-xl font-semibold">{activeCount}</div>
          </div>
          <div className="kx-card2 p-3 md:w-36">
            <div className="text-xs text-neutral-500">Awaiting</div>
            <div className="mt-1 text-xl font-semibold">{awaitingCount}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <section className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-3">
            <input
              className="kx-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setStatusFilter(option)}
                  className={statusFilter === option ? "kx-badge bg-black text-white" : "kx-badge"}
                >
                  {option === "all" ? "All" : statusLabel(option)}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[68vh] overflow-auto">
            {conversations.map((c) => {
              const contact = state.contacts.find((x) => x.id === c.contactId);
              const active = selected?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedConversationId(c.id)}
                  className={active ? "block w-full border-b border-neutral-100 bg-neutral-50 p-4 text-left" : "block w-full border-b border-neutral-100 p-4 text-left hover:bg-neutral-50"}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{contact?.name ?? "Unknown customer"}</div>
                      <div className="mt-1 truncate text-sm text-neutral-500">{c.lastMessagePreview}</div>
                    </div>
                    <div className="text-right text-xs text-neutral-400">
                      <div>{new Date(c.updatedAt).toLocaleDateString()}</div>
                      <div className="mt-2"><span className="kx-badge">{statusLabel(c.status)}</span></div>
                    </div>
                  </div>
                </button>
              );
            })}
            {!conversations.length ? (
              <div className="p-5 text-sm text-neutral-500">No conversations match your search.</div>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4">
          <div className="kx-card2 overflow-hidden">
            <div className="border-b border-neutral-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-base font-semibold">{selectedContact?.name ?? "Select a conversation"}</div>
                  <div className="mt-1 text-sm text-neutral-500">{selectedContact?.phone ?? "Choose a conversation from the list"}</div>
                </div>
                {selected ? (
                  <select
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                    value={selected.status}
                    onChange={(e) => updateStatus(selected.id, e.target.value as "open" | "pending" | "closed")}
                  >
                    <option value="open">Open</option>
                    <option value="pending">Awaiting customer</option>
                    <option value="closed">Resolved</option>
                  </select>
                ) : null}
              </div>
            </div>

            <div className="max-h-[52vh] space-y-3 overflow-auto p-4">
              {selected?.messages.map((m) => (
                <div
                  key={m.id}
                  className={m.direction === "outbound"
                    ? "ml-auto max-w-[84%] rounded-2xl bg-black p-3 text-sm text-white"
                    : "max-w-[84%] rounded-2xl border border-neutral-200 bg-white p-3 text-sm"}
                >
                  <div>{m.body}</div>
                  <div className={m.direction === "outbound" ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-neutral-500"}>
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {selected ? (
              <div className="border-t border-neutral-200 p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="kx-input"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a reply"
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

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="kx-card2 p-4">
              <div className="text-sm font-semibold">Customer details</div>
              <div className="mt-3 space-y-2 text-sm text-neutral-600">
                <div><span className="text-neutral-400">Name:</span> {selectedContact?.name ?? "—"}</div>
                <div><span className="text-neutral-400">Phone:</span> {selectedContact?.phone ?? "—"}</div>
                <div><span className="text-neutral-400">Email:</span> {selectedContact?.email ?? "—"}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedContact?.tags.map((tag) => <span key={tag} className="kx-badge">{tag}</span>)}
              </div>
            </div>

            <div className="kx-card2 p-4">
              <div className="text-sm font-semibold">Notes</div>
              <div className="mt-3 space-y-2">
                {selected?.notes.length ? selected.notes.map((n) => (
                  <div key={n.id} className="rounded-2xl border border-neutral-200 p-3 text-sm">
                    <div>{n.body}</div>
                    <div className="mt-1 text-xs text-neutral-500">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                )) : <div className="text-sm text-neutral-500">No notes yet.</div>}
              </div>
              {selected ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input className="kx-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" />
                  <button
                    className="kx-btn kx-btn-ghost border border-neutral-200"
                    onClick={() => {
                      addNote(selected.id, note);
                      setNote("");
                    }}
                  >
                    Save note
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
