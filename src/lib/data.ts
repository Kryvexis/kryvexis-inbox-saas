import { supabaseServer } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  tenant_id: string | null;
  email: string | null;
  role: "admin" | "agent";
};

export async function getProfile(): Promise<Profile | null> {
  const supabase = supabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, tenant_id, email, role")
    .eq("id", userData.user.id)
    .maybeSingle();
  return (data as any) ?? null;
}

export async function requireTenant(profile: Profile) {
  if (!profile.tenant_id) {
    return { redirectTo: "/onboarding" as const };
  }
  return { tenantId: profile.tenant_id };
}

export async function listConversations(tenantId: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id, status, subject, last_message_preview, updated_at, created_at,
      contact:contacts(id, name, phone, tags),
      assigned:profiles!conversations_assigned_to_fkey(id, email)
    `)
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listMessages(tenantId: string, conversationId: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("messages")
    .select("id, direction, body, created_at")
    .eq("tenant_id", tenantId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listContacts(tenantId: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, phone, email, tags, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAutomations(tenantId: string) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("automation_rules")
    .select("id, name, keyword, auto_reply, enabled, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
}
