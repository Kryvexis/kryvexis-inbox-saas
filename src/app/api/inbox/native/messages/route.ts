import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/serverSupabaseAdmin";
import { getProfile } from "@/lib/data";

async function getTenantContext() {
  const profile = await getProfile();
  const tenantId = profile?.tenant_id ?? null;
  if (!tenantId) return null;

  const admin = getServerSupabaseAdmin();
  if (!admin) return null;

  return { admin, tenantId };
}

export async function POST(request: Request) {
  try {
    const ctx = await getTenantContext();
    if (!ctx) {
      return NextResponse.json({ ok: false, error: "Tenant persistence unavailable" }, { status: 200 });
    }

    const payload = await request.json().catch(() => null) as {
      conversationId?: string;
      body?: string;
      messageId?: string;
    } | null;

    const conversationId = payload?.conversationId?.trim();
    const body = payload?.body?.trim();
    const messageId = payload?.messageId?.trim();

    if (!conversationId || !body || !messageId) {
      return NextResponse.json({ ok: false, error: "Missing conversationId, body, or messageId" }, { status: 400 });
    }

    const { admin, tenantId } = ctx;
    const createdAt = new Date().toISOString();

    const { error: messageError } = await admin.from("messages").upsert({
      id: messageId,
      tenant_id: tenantId,
      conversation_id: conversationId,
      direction: "outbound",
      body,
      created_at: createdAt,
    });
    if (messageError) throw new Error(messageError.message);

    const { error: conversationError } = await admin
      .from("conversations")
      .update({
        last_message_preview: body,
        updated_at: createdAt,
        status: "open",
      })
      .eq("tenant_id", tenantId)
      .eq("id", conversationId);
    if (conversationError) throw new Error(conversationError.message);

    return NextResponse.json({ ok: true, conversationId, messageId, createdAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Native message persistence failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
