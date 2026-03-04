import { redirect } from "next/navigation";
import { getProfile, requireTenant } from "@/lib/data";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  const tenant = await requireTenant(profile);
  if ("redirectTo" in tenant) redirect(tenant.redirectTo);

  return (
    <div className="min-h-screen bg-white">
      <TopNav email={profile.email} />
      <div className="kx-container py-6 flex gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
