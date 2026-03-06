import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(req: Request) {
  const form = await req.formData();
  const mode = String(form.get("mode") || "lead");
  void mode;

  const ssr = await supabaseServer();
  const { data: u } = await ssr.auth.getUser();

  const demoOpen = String(process.env.DEMO_OPEN || "false").toLowerCase() === "true";
  if (!u.user && !demoOpen) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  let tenantId: string | null = null;

  if (u.user) {
    const { data: prof } = await admin
      .from("profiles")
      .select("tenant_id")
      .eq("id", u.user.id)
      .maybeSingle();

    tenantId = (prof?.tenant_id as string | null) ?? null;
  }

  if (!tenantId) {
    const { data: tenant, error } = await admin
      .from("tenants")
      .insert({ name: "Kryvexis Demo" })
      .select("id")
      .single();

    if (error || !tenant?.id) {
      return NextResponse.json(
        { error: error?.message || "Failed creating demo tenant" },
        { status: 500 }
      );
    }

    tenantId = tenant.id;
  }

  const name = pick(["Sipho", "Lerato", "Thabo", "Ayesha", "Zanele", "Ahmed"]) + " " + pick(["M.", "K.", "S.", "N.", "D."]);
  const phone = "27" + String(Math.floor(600000000 + Math.random() * 99999999));

  const { data: contact, error: contactError } = await admin
    .from("contacts")
    .insert({ tenant_id: tenantId, name, phone, tags: "lead" })
    .select("id")
    .single();

  if (contactError || !contact?.id) {
    return NextResponse.json(
      { error: contactError?.message || "Failed creating contact" },
      { status: 500 }
    );
  }

  const subject = pick(["Pricing inquiry", "Delivery question", "New order", "Quote request"]);
  const inboundBody = pick([
    "Hi 👋 can you send your prices?",
    "Do you deliver in my area?",
    "I want a quote please.",
    "How long does shipping take?",
  ]);

  const { data: convo, error: convoError } = await admin
    .from("conversations")
    .insert({
      tenant_id: tenantId,
      contact_id: contact.id,
      status: "open",
      subject,
      last_message_preview: inboundBody,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (convoError || !convo?.id) {
    return NextResponse.json(
      { error: convoError?.message || "Failed creating conversation" },
      { status: 500 }
    );
  }

  const { error: msgError } = await admin.from("messages").insert({
    tenant_id: tenantId,
    conversation_id: convo.id,
    direction: "inbound",
    body: inboundBody,
  });

  if (msgError) {
    return NextResponse.json(
      { error: msgError.message || "Failed creating message" },
      { status: 500 }
    );
  }

  const { data: rules } = await admin
    .from("automation_rules")
    .select("keyword,auto_reply,enabled")
    .eq("tenant_id", tenantId)
    .eq("enabled", true);

  const matched = (rules || []).find((r: { keyword: string; auto_reply: string; enabled: boolean }) =>
    inboundBody.toLowerCase().includes(String(r.keyword).toLowerCase())
  );

  if (matched) {
    await admin.from("messages").insert({
      tenant_id: tenantId,
      conversation_id: convo.id,
      direction: "outbound",
      body: matched.auto_reply,
    });

    await admin
      .from("conversations")
      .update({
        last_message_preview: matched.auto_reply,
        updated_at: new Date().toISOString(),
      })
      .eq("id", convo.id);
  }

  return NextResponse.redirect(new URL(`/app/inbox?id=${convo.id}`, req.url));
}
