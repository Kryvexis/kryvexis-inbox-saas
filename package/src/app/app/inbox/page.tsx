"use client";

import { useMemo, useState } from "react";
import { CheckCheck, CircleDot, Filter, MessageSquareShare, Search, Tags } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import type { Conversation, Status } from "@/lib/types";

const statusLabels: Record<Status, string> = {
  new: "New",
  open: "Open",
  waiting: "Awaiting customer",
  resolved: "Resolved"
};

export default function InboxPage() {
  const { state, selectedConversationId, setSelectedConversationId, sendMessage, addNote, updateStatus } = useStore();
  const [body, setBody] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const conversations = useMemo(() => {
    return state.conversations.filter((conversation) => {
      const contact = state.contacts.find((item) => item.id === conversation.contactId);
      const matchesSearch = [
        contact?.name,
        contact?.phone,
        contact?.company,
        conversation.subject,
        conversation.lastMessagePreview,
        ...conversation.labels
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "all" || conversation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, state.contacts, state.conversations, statusFilter]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) ?? conversations[0] ?? state.conversations[0],
    [conversations, selectedConversationId, state.conversations]
  );

  const selectedContact = state.contacts.find((c) => c.id === selected?.contactId);
  const assignedAgent = state.team.find((member) => member.id === selected?.assignedTo);

  const quickReplies = [
    "Thanks — I’m checking that for you now.",
    "I can send a quote through shortly.",
    "Please share your area so I can confirm delivery.",
    "Noted. I’ll hand this to the team and update you shortly."
  ];

  const queueStats = {
    total: state.conversations.length,
    unread: state.conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0),
    whatsapp: state.conversations.filter((conversation) => conversation.channel === "whatsapp").length,
    open: state.conversations.filter((conversation) => conversation.status === "open" || conversation.status === "new").length
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xl font-semibold">Kryvexis Inbox System</div>
          <div className="mt-1 text-sm text-neutral-500">Meta-ready conversation workspace for WhatsApp, web enquiries, and internal follow-up.</div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"><div className="text-neutral-500">Queue</div><div className="font-semibold">{queueStats.total}</div></div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"><div className="text-neutral-500">Unread</div><div className="font-semibold">{queueStats.unread}</div></div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"><div className="text-neutral-500">WhatsApp</div><div className="font-semibold">{queueStats.whatsapp}</div></div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"><div className="text-neutral-500">Active</div><div className="font-semibold">{queueStats.open}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)_320px]">
        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-2">
              <Search size={16} className="text-neutral-400" />
              <input className="w-full bg-transparent text-sm outline-none" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contacts, labels, or messages" />
            </div>
            <div className="mt-3 flex items-center gap-2 overflow-auto pb-1 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-neutral-500"><Filter size={12} /> Queue</span>
              {(["all", "new", "open", "waiting", "resolved"] as const).map((value) => (
                <button
                  key={value}
                  className={statusFilter === value ? "rounded-full bg-black px-3 py-1.5 text-white" : "rounded-full border border-neutral-200 px-3 py-1.5 text-neutral-600"}
                  onClick={() => setStatusFilter(value)}
                >
                  {value === "all" ? "All" : statusLabels[value]}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[72vh] overflow-auto">
            {conversations.map((conversation) => {
              const contact = state.contacts.find((item) => item.id === conversation.contactId);
              const active = selected?.id === conversation.id;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={active ? "block w-full border-b border-neutral-100 bg-neutral-50 p-4 text-left" : "block w-full border-b border-neutral-100 p-4 text-left hover:bg-neutral-50"}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{contact?.name ?? "Unknown contact"}</div>
                      <div className="mt-0.5 truncate text-xs text-neutral-500">{contact?.company ?? conversation.subject}</div>
                    </div>
                    {conversation.unreadCount > 0 ? <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">{conversation.unreadCount}</span> : null}
                  </div>
                  <div className="mt-2 line-clamp-2 text-sm text-neutral-600">{conversation.lastMessagePreview}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span className="kx-badge">{statusLabels[conversation.status]}</span>
                    <span className="kx-badge">{conversation.channel}</span>
                    {conversation.priority === "high" ? <span className="kx-badge border-amber-200 text-amber-700">Priority</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="kx-card2 overflow-hidden">
          <div className="border-b border-neutral-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">{selectedContact?.name ?? "Select conversation"}</div>
                <div className="mt-1 text-xs text-neutral-500">{selectedContact?.phone ?? "No contact selected"}</div>
              </div>
              {selected ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="kx-badge">{selected.channel}</span>
                  <select
                    className="rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                    value={selected.status}
                    onChange={(e) => updateStatus(selected.id, e.target.value as Conversation["status"])}
                  >
                    <option value="new">New</option>
                    <option value="open">Open</option>
                    <option value="waiting">Awaiting customer</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          <div className="max-h-[58vh] overflow-auto bg-neutral-50/60 p-4 space-y-3">
            {selected?.messages.map((message) => (
              <div
                key={message.id}
                className={message.direction === "outbound"
                  ? "ml-auto max-w-[88%] rounded-3xl border border-black bg-black p-3 text-sm text-white sm:max-w-[78%]"
                  : message.direction === "internal"
                    ? "mx-auto max-w-[92%] rounded-3xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:max-w-[84%]"
                    : "max-w-[88%] rounded-3xl border border-neutral-200 bg-white p-3 text-sm sm:max-w-[78%]"}
              >
                <div>{message.body}</div>
                <div className={message.direction === "outbound" ? "mt-2 flex items-center gap-2 text-xs text-white/70" : "mt-2 flex items-center gap-2 text-xs text-neutral-500"}>
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                  {message.direction === "outbound" ? (
                    <span className="inline-flex items-center gap-1"><CheckCheck size={12} /> {message.deliveryState ?? "sent"}</span>
                  ) : null}
                  {message.author ? <span>• {message.author}</span> : null}
                </div>
              </div>
            ))}
          </div>

          {selected ? (
            <div className="border-t border-neutral-200 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button key={reply} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50" onClick={() => setBody(reply)}>
                    {reply}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="kx-input"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a customer reply"
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
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Conversation details</div>
              {selected?.priority === "high" ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">High priority</span> : null}
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div><span className="text-neutral-500">Customer:</span> {selectedContact?.name ?? "—"}</div>
              <div><span className="text-neutral-500">Company:</span> {selectedContact?.company ?? "—"}</div>
              <div><span className="text-neutral-500">Assigned:</span> {assignedAgent?.name ?? "Unassigned"}</div>
              <div><span className="text-neutral-500">Source:</span> {selected?.channel ?? "—"}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selected?.labels.map((label) => (
                <span key={label} className="kx-badge inline-flex items-center gap-1"><Tags size={12} /> {label}</span>
              ))}
            </div>
          </div>

          <div className="kx-card2 p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><MessageSquareShare size={16} /> Channel readiness</div>
            <div className="mt-3 space-y-3 text-sm text-neutral-600">
              <div className="rounded-2xl border border-neutral-200 p-3">
                <div className="font-medium text-neutral-900">WhatsApp-ready inbox</div>
                <div className="mt-1">Conversation cards already support source labels, unread counts, quick replies, and delivery states.</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-3">
                <div className="font-medium text-neutral-900">Webhook-friendly message thread</div>
                <div className="mt-1">Each message row now has channel and delivery-state fields ready for Meta webhook events later.</div>
              </div>
            </div>
          </div>

          <div className="kx-card2 p-4">
            <div className="text-sm font-medium">Internal notes</div>
            <div className="mt-3 space-y-2">
              {selected?.notes.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-neutral-200 p-3 text-sm">
                  <div>{entry.body}</div>
                  <div className="mt-1 text-xs text-neutral-500">{new Date(entry.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            {selected ? (
              <div className="mt-3 flex gap-2">
                <input className="kx-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add internal note" />
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

          <div className="kx-card2 p-4 text-sm text-neutral-600">
            <div className="flex items-center gap-2 font-medium text-neutral-900"><CircleDot size={16} /> Mobile-friendly operator flow</div>
            <div className="mt-2">On smaller screens the queue, thread, and detail cards stack cleanly so operators can still respond without table-heavy layouts.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
