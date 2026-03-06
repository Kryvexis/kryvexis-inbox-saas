import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const keyword = String(form.get("keyword") || "").trim();
  const autoReply = String(form.get("auto_reply") || "").trim();

  if (!keyword || !autoReply) {
    return NextResponse.redirect(new URL("/app/automations", req.url));
  }

  const ssr = await supabaseServer();
  const { data: u } = await ssr.auth.getUser();
  if (!u.user) return NextResponse.redirect(new URL("/login", req.url));

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: prof, error: profError } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", u.user.id)
    .single();

  if (profError || !prof?.tenant_id) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  await admin.from("automation_rules").insert({
    tenant_id: prof.tenant_id,
    name: `Keyword: ${keyword}`,
    keyword,
    auto_reply: autoReply,
    enabled: true,
  });

  return NextResponse.redirect(new URL("/app/automations", req.url));
}
