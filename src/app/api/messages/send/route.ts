import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const conversationId = String(form.get("conversation_id") || "");
  const body = String(form.get("body") || "").trim();

  if (!conversationId || !body) {
    return NextResponse.redirect(new URL("/app/inbox", req.url));
  }

  const ssr = await supabaseServer();
  const { data: u } = await ssr.auth.getUser();
  if (!u.user) return NextResponse.redirect(new URL("/login", req.url));

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: convo, error: convoError } = await admin
    .from("conversations")
    .select("tenant_id")
    .eq("id", conversationId)
    .single();

  if (convoError || !convo?.tenant_id) {
    return NextResponse.json(
      { error: convoError?.message || "Conversation not found" },
      { status: 400 }
    );
  }

  const tenantId = convo.tenant_id as string;

  const { error: msgError } = await admin.from("messages").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    direction: "outbound",
    body,
  });

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 400 });
  }

  await admin
    .from("conversations")
    .update({ last_message_preview: body, updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return NextResponse.redirect(new URL(`/app/inbox?id=${conversationId}`, req.url));
}
