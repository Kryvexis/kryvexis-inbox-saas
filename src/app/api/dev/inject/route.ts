
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: Request) {
  const form = await req.formData();
  const mode = String(form.get("mode") || "lead");

  const ssr = supabaseServer();
  const { data: u } = await ssr.auth.getUser();

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  let tenant_id: string | null = null;

  if (u?.user) {
    const { data: prof } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", u.user.id)
      .maybeSingle();

    tenant_id = prof?.tenant_id ?? null;
  }

  // If still no tenant create demo tenant safely
  if (!tenant_id) {
    const { data: tenant, error } = await admin
      .from("tenants")
      .insert({ name: "Kryvexis Demo" })
      .select("id")
      .single();

    if (error || !tenant) {
      return NextResponse.json({ error: "Failed creating demo tenant" }, { status: 500 });
    }

    tenant_id = tenant.id;
  }

  const name = pick(["Sipho","Lerato","Thabo","Ayesha","Zanele","Ahmed"]);
  const phone = "27" + Math.floor(600000000 + Math.random() * 99999999);

  const { data: contact } = await admin
    .from("contacts")
    .insert({ tenant_id, name, phone, tags: "lead" })
    .select("id")
    .single();

  const inboundBody = pick([
    "Hi can you send prices?",
    "Do you deliver here?",
    "I want a quote",
    "How long is shipping?"
  ]);

  const { data: convo } = await admin
    .from("conversations")
    .insert({
      tenant_id,
      contact_id: contact?.id,
      status: "open",
      subject: "New lead",
      last_message_preview: inboundBody,
      updated_at: new Date().toISOString()
    })
    .select("id")
    .single();

  await admin.from("messages").insert({
    tenant_id,
    conversation_id: convo?.id,
    direction: "inbound",
    body: inboundBody
  });

  return NextResponse.redirect(new URL(`/app/inbox?id=${convo?.id}`, req.url));
}
