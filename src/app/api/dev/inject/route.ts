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

  const demoOpen = String(process.env.DEMO_OPEN || "false").toLowerCase() === "true";
  if (!u.user && !demoOpen) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Determine tenant
  let tenant_id: string | null = null;

  if (u.user) {
    const { data: prof } = await admin.from("profiles").select("tenant_id").eq("id", u.user.id).maybeSingle();
    tenant_id = (prof?.tenant_id as string) || null;
  }

  if (!tenant_id) {
    // If demo open but no user/tenant, create a demo tenant automatically
    const { data: t, error: tErr } = await admin
      .from("tenants")
      .insert({ name: "Kryvexis Demo" })
      .select("id")
      .single();

    if (tErr || !t?.id) {
      return NextResponse.json(
        { error: "Failed to create demo tenant", details: tErr?.message || "No tenant id returned" },
        { status: 500 }
      );
    }

    tenant_id = t.id;
  }

  // Create / upsert contact
  const name = pick(["Sipho", "Lerato", "Thabo", "Ayesha", "Zanele", "Ahmed"]) + " " + pick(["M.", "K.", "S.", "N.", "D."]);
  const phone = "27" + String(Math.floor(600000000 + Math.random() * 99999999));
  const tags = mode === "lead" ? "lead,urgent" : "lead";

  const { data: contact, error: contactErr } = await admin
    .from("contacts")
    .insert({ tenant_id, name, phone, tags })
    .select("id")
    .single();

  if (contactErr || !contact?.id) {
    return NextResponse.json(
      { error: "Failed to create contact", details: contactErr?.message ?? "contact is null" },
      { status: 500 }
    );
  }

  const contactId = contact.id;

  // Create conversation
  const subject = pick(["Pricing inquiry", "Delivery question", "New order", "Quote request"]);
  const inboundBody = pick([
    "Hi 👋 can you send your prices?",
    "Do you deliver in my area?",
    "I want a quote please.",
    "How long does shipping take?",
  ]);

  const { data: convo } = await admin
    .from("conversations")
    .insert({
      tenant_id,
      contact_id: contactId,
      status: "open",
      subject,
      last_message_preview: inboundBody,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  // Insert inbound message
  await admin.from("messages").insert({
    tenant_id,
    conversation_id: convo.id,
    direction: "inbound",
    body: inboundBody,
  });

  // Apply automation rule if matched
  const { data: rules } = await admin
    .from("automation_rules")
    .select("keyword,auto_reply,enabled")
    .eq("tenant_id", tenant_id)
    .eq("enabled", true);

  const matched = (rules || []).find((r: any) => inboundBody.toLowerCase().includes(String(r.keyword).toLowerCase()));
  if (matched) {
    await admin.from("messages").insert({
      tenant_id,
      conversation_id: convo.id,
      direction: "outbound",
      body: matched.auto_reply,
    });
    await admin.from("conversations").update({ last_message_preview: matched.auto_reply, updated_at: new Date().toISOString() }).eq("id", convo.id);
  }

  return NextResponse.redirect(new URL(`/app/inbox?id=${convo.id}`, req.url));
}
