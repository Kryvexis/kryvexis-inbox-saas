"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";

export default function ContactsPage() {
  const { state } = useStore();
  const [query, setQuery] = useState("");

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.contacts.filter((contact) => {
      if (!q) return true;
      return [contact.name, contact.phone, contact.email ?? "", contact.tags.join(" ")].some((value) => value.toLowerCase().includes(q));
    });
  }, [query, state.contacts]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xl font-semibold">Contacts</div>
          <div className="text-sm text-neutral-500">Light CRM view for search, segmenting, and quick sales context.</div>
        </div>
        <div className="relative min-w-[260px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <input className="kx-input pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, tag" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Kpi label="Total contacts" value={state.contacts.length} />
        <Kpi label="Lead contacts" value={state.contacts.filter((c) => c.tags.includes("lead")).length} />
        <Kpi label="Paid contacts" value={state.contacts.filter((c) => c.tags.includes("paid")).length} />
        <Kpi label="Priority / VIP" value={state.contacts.filter((c) => c.tags.includes("priority") || c.tags.includes("vip")).length} />
      </div>

      <div className="kx-card2 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="p-3 text-left font-medium">Name</th>
              <th className="p-3 text-left font-medium">Phone</th>
              <th className="p-3 text-left font-medium">Email</th>
              <th className="p-3 text-left font-medium">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="border-t border-neutral-100">
                <td className="p-3 font-medium">{contact.name}</td>
                <td className="p-3">{contact.phone}</td>
                <td className="p-3">{contact.email ?? "—"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag) => <span key={tag} className="kx-badge">{tag}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filteredContacts.length ? <div className="p-6 text-sm text-neutral-500">No contacts match your search yet.</div> : null}
      </div>
    </div>
  );
}
