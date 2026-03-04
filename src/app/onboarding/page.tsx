import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getProfile } from "@/lib/data";
import { TopNav } from "@/components/TopNav";

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.tenant_id) redirect("/app/inbox");

  async function createTenant(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    if (!name) return;

    const supabase = supabaseServer();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    // Create tenant
    const { data: tenant, error: tErr } = await supabase
      .from("tenants")
      .insert({ name })
      .select("id")
      .single();
    if (tErr) throw new Error(tErr.message);

    // Attach profile to tenant as admin
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ tenant_id: tenant.id, role: "admin", email: user.email })
      .eq("id", user.id);
    if (pErr) throw new Error(pErr.message);

    redirect("/app/inbox");
  }

  return (
    <main className="min-h-screen bg-white">
      <TopNav email={profile.email} />
      <div className="kx-container py-12 max-w-2xl">
        <div className="kx-card p-8">
          <div className="kx-h1">Create your workspace</div>
          <p className="mt-3 text-neutral-600">
            Name your company. This creates your tenant and unlocks the Inbox.
          </p>

          <form action={createTenant} className="mt-8 space-y-3">
            <div>
              <label className="text-sm font-medium">Company name</label>
              <input name="name" className="mt-2 kx-input" placeholder="Kryvexis (Pty) Ltd" />
            </div>

            <button className="kx-btn kx-btn-primary px-5 py-3">Create workspace</button>

            <div className="mt-3 text-xs text-neutral-500">
              Tip: For demos, create “Kryvexis Demo” and inject messages from the Inbox sidebar.
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
