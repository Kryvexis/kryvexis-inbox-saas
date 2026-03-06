import { redirect } from "next/navigation";
import { getProfile, listConversations } from "@/lib/data";
import { Kpi } from "@/components/Kpi";
import { BarChart3, Clock, Inbox } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.tenant_id) {
    redirect("/onboarding");
  }

  const tenantId = profile.tenant_id;
  const convos = await listConversations(tenantId);

  const open = convos.filter((c: any) => c.status === "open").length;
  const pending = convos.filter((c: any) => c.status === "pending").length;
  const closed = convos.filter((c: any) => c.status === "closed").length;

  const supabase = await supabaseServer();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("created_at", since);

  return (
    <div className="grid gap-4">
      <div>
        <div className="kx-h2">Analytics</div>
        <div className="text-sm text-neutral-500">Simple KPIs for demos (expand later).</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Kpi
          label="Messages (24h)"
          value={count ?? 0}
          icon={<Clock size={18} className="text-neutral-500" />}
        />
        <Kpi
          label="Open"
          value={open}
          icon={<Inbox size={18} className="text-neutral-500" />}
        />
        <Kpi
          label="Closed"
          value={closed}
          icon={<BarChart3 size={18} className="text-neutral-500" />}
        />
      </div>

      <div className="kx-card2 p-6">
        <div className="text-sm font-semibold">Status breakdown</div>
        <div className="mt-3 text-sm text-neutral-600">
          Open: <b>{open}</b> • Pending: <b>{pending}</b> • Closed: <b>{closed}</b>
        </div>
        <div className="mt-3 text-xs text-neutral-500">
          Next: response-time SLA, agent performance, revenue attribution.
        </div>
      </div>
    </div>
  );
}
