"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";

export default function InboxPage() {
  const { state, selectedConversationId, setSelectedConversationId, sendMessage, addNote, updateStatus } = useStore();
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");

  const selected = useMemo(
    () => state.conversations.find((c) => c.id === selectedConversationId) ?? state.conversations[0],
    [state.conversations, selectedConversationId]
  );

  const selectedContact = state.contacts.find((c) => c.id === selected?.contactId);

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Inbox</div>
        <div className="text-sm text-neutral-500">Manage inbound conversations, follow-ups, and customer activity from one inbox.</div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr_320px]">
        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-3 text-sm font-medium">Conversations</div>
          <div className="max-h-[72vh] overflow-auto">
            {state.conversations.map((c) => {
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
                    <span className="kx-badge">{c.status}</span>
                  </div>
                  <div className="mt-1 truncate text-xs text-neutral-500">{c.lastMessagePreview}</div>
                  <div className="mt-2 text-xs text-neutral-500">{contact?.phone}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{selectedContact?.name ?? "Select conversation"}</div>
              <div className="text-xs text-neutral-500">{selectedContact?.phone}</div>
            </div>
            {selected ? (
              <select
                className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                value={selected.status}
                onChange={(e) => updateStatus(selected.id, e.target.value as "open" | "pending" | "closed")}
              >
                <option value="open">Open</option>
                <option value="pending">Awaiting response</option>
                <option value="closed">Closed</option>
              </select>
            ) : null}
          </div>

          <div className="max-h-[58vh] overflow-auto p-4 space-y-3">
            {selected?.messages.map((m) => (
              <div
                key={m.id}
                className={m.direction === "outbound"
                  ? "ml-auto max-w-[80%] rounded-2xl border border-black bg-black p-3 text-sm text-white"
                  : "max-w-[80%] rounded-2xl border border-neutral-200 bg-white p-3 text-sm"}
              >
                <div>{m.body}</div>
                <div className={m.direction === "outbound" ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-neutral-500"}>
                  {m.direction} • {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {selected ? (
            <div className="border-t border-neutral-200 p-3">
              <div className="flex gap-2">
                <input
                  className="kx-input"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a reply..."
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
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedContact?.tags.map((tag) => <span key={tag} className="kx-badge">{tag}</span>)}
              </div>
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
                <input className="kx-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note..." />
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
