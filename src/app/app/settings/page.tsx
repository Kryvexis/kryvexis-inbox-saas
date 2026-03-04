import { redirect } from "next/navigation";
import { getProfile, requireTenant } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const tenant = await requireTenant(profile);
  if ("redirectTo" in tenant) redirect(tenant.redirectTo);

  const supabase = supabaseServer();
  const { data: tenantRow } = await supabase.from("tenants").select("id,name,created_at").eq("id", tenant.tenantId).single();

  return (
    <div className="grid gap-4">
      <div>
        <div className="kx-h2">Settings</div>
        <div className="text-sm text-neutral-500">Workspace information (billing later).</div>
      </div>

      <div className="kx-card2 p-6">
        <div className="text-sm font-semibold">Workspace</div>
        <div className="mt-3 text-sm text-neutral-700">
          <div><span className="text-neutral-500">Name:</span> <b>{tenantRow?.name}</b></div>
          <div className="mt-1"><span className="text-neutral-500">Tenant ID:</span> <span className="font-mono text-xs">{tenantRow?.id}</span></div>
          <div className="mt-1"><span className="text-neutral-500">Created:</span> {tenantRow?.created_at ? new Date(tenantRow.created_at).toLocaleString() : "—"}</div>
        </div>
      </div>

      <div className="kx-card2 p-6">
        <div className="text-sm font-semibold">Roadmap</div>
        <ul className="mt-3 list-disc pl-5 text-sm text-neutral-600 space-y-1">
          <li>Invite team members + roles</li>
          <li>Quotes + invoices + product catalog</li>
          <li>WhatsApp Cloud API integration</li>
          <li>PayFast/Stripe billing</li>
          <li>AI assistant for replies</li>
        </ul>
      </div>
    </div>
  );
}
