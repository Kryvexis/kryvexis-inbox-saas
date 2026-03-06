"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";
import { Search } from "lucide-react";

export default function ContactsPage() {
  const { state } = useStore();
  const [query, setQuery] = useState("");

  const contacts = useMemo(() => {
    return state.contacts.filter((c) => [c.name, c.phone, c.email, c.tags.join(" ")].join(" ").toLowerCase().includes(query.toLowerCase()));
  }, [query, state.contacts]);

  return (
    <div className="kx-page">
      <section className="kx-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">CRM contacts</div>
            <h1 className="mt-2 kx-section-title">Better list readability, less clutter on mobile.</h1>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <Kpi label="Total contacts" value={state.contacts.length} />
            <Kpi label="Lead contacts" value={state.contacts.filter((c) => c.tags.includes("lead")).length} />
            <Kpi label="Paid contacts" value={state.contacts.filter((c) => c.tags.includes("paid")).length} />
          </div>
        </div>
      </section>

      <section className="kx-card2 overflow-hidden">
        <div className="border-b border-neutral-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="kx-panel-title">Customer list</div>
              <div className="mt-1 text-sm text-neutral-500">Fast scanning with cleaner mobile cards.</div>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input className="kx-input pl-11" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contacts" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:hidden">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="font-medium">{c.name}</div>
              <div className="mt-1 text-sm text-neutral-500">{c.phone}</div>
              <div className="mt-1 text-sm text-neutral-500">{c.email ?? "—"}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.tags.map((t) => <span key={t} className="kx-badge">{t}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Phone</th>
                <th className="p-4 text-left font-medium">Email</th>
                <th className="p-4 text-left font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-t border-neutral-100">
                  <td className="p-4 font-medium">{c.name}</td>
                  <td className="p-4">{c.phone}</td>
                  <td className="p-4">{c.email ?? "—"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {c.tags.map((t) => <span key={t} className="kx-badge">{t}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
