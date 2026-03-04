import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const conversation_id = String(form.get("conversation_id") || "");
  const body = String(form.get("body") || "").trim();
  if (!conversation_id || !body) return NextResponse.redirect(new URL("/app/inbox", req.url));

  const ssr = supabaseServer();
  const { data: u } = await ssr.auth.getUser();
  if (!u.user) return NextResponse.redirect(new URL("/login", req.url));

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Fetch tenant_id for conversation
  const { data: convo, error: cErr } = await admin
    .from("conversations")
    .select("tenant_id")
    .eq("id", conversation_id)
    .single();
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 400 });

  const tenant_id = convo.tenant_id as string;

  // Insert outbound message
  const { error: mErr } = await admin.from("messages").insert({
    tenant_id,
    conversation_id,
    direction: "outbound",
    body,
  });
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 400 });

  // Update conversation preview
  await admin
    .from("conversations")
    .update({ last_message_preview: body, updated_at: new Date().toISOString() })
    .eq("id", conversation_id);

  return NextResponse.redirect(new URL(`/app/inbox?id=${conversation_id}`, req.url));
}
