"use client";

import { useMemo, useState } from "react";
import { Kpi } from "@/components/Kpi";
import { useStore } from "@/components/StoreProvider";
import { cn } from "@/lib/cn";
import { Clock3, MessageSquareText, NotebookPen, Search, UserRound } from "lucide-react";

const statusClass: Record<string, string> = {
  open: "kx-status-open",
  pending: "kx-status-pending",
  closed: "kx-status-closed"
};

export default function InboxPage() {
  const { state, selectedConversationId, setSelectedConversationId, sendMessage, addNote, updateStatus } = useStore();
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");

  const conversations = useMemo(() => {
    return state.conversations.filter((c) => {
      const contact = state.contacts.find((x) => x.id === c.contactId);
      const haystack = [contact?.name, contact?.phone, c.subject, c.lastMessagePreview].join(" ").toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [query, state.contacts, state.conversations]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? conversations[0],
    [conversations, selectedConversationId]
  );

  const selectedContact = state.contacts.find((c) => c.id === selected?.contactId);
  const openCount = state.conversations.filter((c) => c.status === "open").length;
  const pendingCount = state.conversations.filter((c) => c.status === "pending").length;
  const closedCount = state.conversations.filter((c) => c.status === "closed").length;

  return (
    <div className="kx-page">
      <section className="kx-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">Inbox workspace</div>
            <h1 className="mt-2 kx-section-title">Conversations with clean CRM context.</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500 sm:text-base">
              Desktop keeps the full three-panel workflow. Mobile stays focused on only the essential list, chat and profile pieces.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[440px]">
            <Kpi label="Open" value={openCount} />
            <Kpi label="Pending" value={pendingCount} />
            <Kpi label="Closed" value={closedCount} />
            <Kpi label="Messages" value={state.conversations.flatMap((c) => c.messages).length} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)_320px]">
        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-100 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="kx-panel-title">Conversations</div>
                <div className="mt-1 text-sm text-neutral-500">Search, scan and jump into replies fast.</div>
              </div>
              <span className="kx-badge">{conversations.length}</span>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                className="kx-input pl-11"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, phone or message"
              />
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
                  className={cn(
                    "block w-full border-b border-neutral-100 p-4 text-left transition hover:bg-neutral-50",
                    active && "bg-neutral-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{contact?.name ?? "Unknown"}</div>
                      <div className="mt-1 line-clamp-1 text-sm text-neutral-500">{c.lastMessagePreview}</div>
                    </div>
                    <span className={cn("kx-badge", statusClass[c.status])}>{c.status}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-neutral-400">
                    <span>{contact?.phone}</span>
                    <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-100 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-base font-semibold">{selectedContact?.name ?? "Select a conversation"}</div>
                <div className="mt-1 text-sm text-neutral-500">{selectedContact?.phone ?? "No conversation selected"}</div>
              </div>
              {selected ? (
                <select
                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm"
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value as "open" | "pending" | "closed")}
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              ) : null}
            </div>
          </div>

          <div className="max-h-[58vh] space-y-4 overflow-auto bg-[linear-gradient(180deg,#ffffff_0%,#f9fafb_100%)] p-4 sm:p-5">
            {selected?.messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[88%] rounded-[24px] px-4 py-3 text-sm shadow-sm",
                  m.direction === "outbound"
                    ? "ml-auto bg-neutral-950 text-white"
                    : m.direction === "internal"
                      ? "border border-amber-200 bg-amber-50 text-amber-900"
                      : "border border-neutral-200 bg-white text-neutral-800"
                )}
              >
                <div>{m.body}</div>
                <div className={cn("mt-2 text-[11px]", m.direction === "outbound" ? "text-white/60" : "text-neutral-400") }>
                  {m.direction} • {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {selected ? (
            <div className="border-t border-neutral-100 p-4 sm:p-5">
              <div className="rounded-[26px] border border-neutral-200 bg-white p-2 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    className="kx-input border-0 px-3 py-3 shadow-none focus:ring-0"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a reply..."
                  />
                  <button
                    className="kx-btn kx-btn-primary min-w-[110px]"
                    onClick={() => {
                      sendMessage(selected.id, body);
                      setBody("");
                    }}
                  >
                    <MessageSquareText size={16} /> Send
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4 xl:space-y-4">
          <div className="kx-card2 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><UserRound size={16} /> Customer profile</div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl bg-neutral-50 p-3">
                <div className="text-neutral-400">Name</div>
                <div className="mt-1 font-medium">{selectedContact?.name ?? "—"}</div>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-3">
                <div className="text-neutral-400">Phone</div>
                <div className="mt-1 font-medium">{selectedContact?.phone ?? "—"}</div>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-3">
                <div className="text-neutral-400">Email</div>
                <div className="mt-1 font-medium">{selectedContact?.email ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-neutral-400">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedContact?.tags.map((tag) => <span key={tag} className="kx-badge">{tag}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="kx-card2 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><NotebookPen size={16} /> Internal notes</div>
            <div className="mt-4 space-y-3">
              {selected?.notes.map((n) => (
                <div key={n.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm">
                  <div>{n.body}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
                    <Clock3 size={12} /> {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            {selected ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input className="kx-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note..." />
                <button
                  className="kx-btn kx-btn-soft"
                  onClick={() => {
                    addNote(selected.id, note);
                    setNote("");
                  }}
                >
                  Add note
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
