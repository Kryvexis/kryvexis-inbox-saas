"use client";

import { useStore } from "@/components/StoreProvider";
import { Kpi } from "@/components/Kpi";

export default function ContactsPage() {
  const { state } = useStore();

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Contacts</div>
        <div className="text-sm text-neutral-500">Light CRM view of customers and tags.</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Kpi label="Total contacts" value={state.contacts.length} />
        <Kpi label="Lead contacts" value={state.contacts.filter((c) => c.tags.includes("lead")).length} />
        <Kpi label="Paid contacts" value={state.contacts.filter((c) => c.tags.includes("paid")).length} />
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
            {state.contacts.map((c) => (
              <tr key={c.id} className="border-t border-neutral-100">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.email ?? "—"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {c.tags.map((t) => <span key={t} className="kx-badge">{t}</span>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
