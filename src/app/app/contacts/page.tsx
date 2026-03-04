import { redirect } from "next/navigation";
import { getProfile, requireTenant, listContacts } from "@/lib/data";
import { Kpi } from "@/components/Kpi";
import { Users } from "lucide-react";

export default async function ContactsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const tenant = await requireTenant(profile);
  if ("redirectTo" in tenant) redirect(tenant.redirectTo);

  const contacts = await listContacts(tenant.tenantId);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="kx-h2">Contacts</div>
          <div className="text-sm text-neutral-500">A light CRM view of customers.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Kpi label="Total contacts" value={contacts.length} icon={<Users size={18} className="text-neutral-500" />} />
        <Kpi label="Tagged leads" value={contacts.filter((c: any) => (c.tags || "").includes("lead")).length} />
        <Kpi label="Tagged paid" value={contacts.filter((c: any) => (c.tags || "").includes("paid")).length} />
      </div>

      <div className="kx-card2 overflow-hidden">
        <div className="border-b border-neutral-200 p-3 text-sm font-medium">All contacts</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Email</th>
                <th className="text-left p-3 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c: any) => (
                <tr key={c.id} className="border-t border-neutral-100">
                  <td className="p-3">{c.name || "—"}</td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3">{c.email || "—"}</td>
                  <td className="p-3 text-neutral-600">{c.tags || ""}</td>
                </tr>
              ))}
              {!contacts.length ? (
                <tr>
                  <td className="p-6 text-neutral-500" colSpan={4}>
                    No contacts yet. Inject a demo lead from Inbox.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
