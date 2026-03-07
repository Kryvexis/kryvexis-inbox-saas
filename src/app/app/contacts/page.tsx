"use client";

import { useMemo, useState } from "react";
import { Kpi } from "@/components/Kpi";
import { useStore } from "@/components/StoreProvider";

export default function ContactsPage() {
  const { state } = useStore();
  const [query, setQuery] = useState("");

  const contacts = useMemo(() => state.contacts.filter((c) => {
    if (!query.trim()) return true;
    return [c.name, c.phone, c.email, c.tags.join(" ")].filter(Boolean).some((v) => String(v).toLowerCase().includes(query.toLowerCase()));
  }), [query, state.contacts]);

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Contacts</div>
        <div className="mt-1 text-sm text-neutral-500">A simple contact list for the customers you are working with.</div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kpi label="Total" value={state.contacts.length} />
        <Kpi label="Leads" value={state.contacts.filter((c) => c.tags.includes("lead")).length} />
        <Kpi label="Customers" value={state.contacts.filter((c) => c.tags.includes("paid")).length} />
      </div>

      <div className="kx-card2 p-4">
        <input className="kx-input md:max-w-sm" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contacts" />
        <div className="mt-4 grid gap-3">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-2xl border border-neutral-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="mt-1 text-sm text-neutral-500">{c.phone}</div>
                  <div className="mt-1 text-sm text-neutral-500">{c.email ?? "No email saved"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((t) => <span key={t} className="kx-badge">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
          {!contacts.length ? <div className="text-sm text-neutral-500">No contacts match your search.</div> : null}
        </div>
      </div>
    </div>
  );
}
