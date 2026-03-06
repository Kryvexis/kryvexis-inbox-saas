import { redirect } from "next/navigation";
import { getProfile, listAutomations } from "@/lib/data";

export default async function AutomationsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.tenant_id) {
    redirect("/onboarding");
  }

  const tenantId = profile.tenant_id;
  const rules = await listAutomations(tenantId);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="kx-h2">Automations</div>
          <div className="text-sm text-neutral-500">
            Keyword rules for instant replies (pre-API).
          </div>
        </div>

        <form action="/api/automations/create" method="post" className="flex gap-2">
          <input className="kx-input" name="keyword" placeholder="keyword (e.g. price)" />
          <input className="kx-input" name="auto_reply" placeholder="auto reply text" />
          <button className="kx-btn kx-btn-primary">Add rule</button>
        </form>
      </div>

      <div className="kx-card2 overflow-hidden">
        <div className="border-b border-neutral-200 p-3 text-sm font-medium">Rules</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Keyword</th>
                <th className="text-left p-3 font-medium">Auto reply</th>
                <th className="text-left p-3 font-medium">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r: any) => (
                <tr key={r.id} className="border-t border-neutral-100">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">
                    <span className="kx-badge">{r.keyword}</span>
                  </td>
                  <td className="p-3 text-neutral-600">{r.auto_reply}</td>
                  <td className="p-3">{r.enabled ? "Yes" : "No"}</td>
                </tr>
              ))}
              {!rules.length ? (
                <tr>
                  <td className="p-6 text-neutral-500" colSpan={4}>
                    No rules yet. Add one above (e.g. keyword “price” → auto reply “Here are our packages…”).
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        When WhatsApp APIs are added, inbound messages will be checked against these rules.
      </div>
    </div>
  );
}
