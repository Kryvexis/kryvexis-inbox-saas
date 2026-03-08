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

    const payload = (await request.json().catch(() => null)) as {
      contact?: { id?: string; name?: string; phone?: string; email?: string; tags?: string[] };
      conversation?: { id?: string; subject?: string; status?: string; lastMessagePreview?: string; updatedAt?: string };
      initialMessage?: { id?: string; body?: string; direction?: string; createdAt?: string };
    } | null;

    const contactId = payload?.contact?.id?.trim();
    const conversationId = payload?.conversation?.id?.trim();
    const messageId = payload?.initialMessage?.id?.trim();
    const name = payload?.contact?.name?.trim();
    const subject = payload?.conversation?.subject?.trim();
    const body = payload?.initialMessage?.body?.trim();

    if (!contactId || !conversationId || !messageId || !name || !subject || !body) {
      return NextResponse.json({ ok: false, error: "Missing native conversation fields" }, { status: 400 });
    }

    const { admin, tenantId } = ctx;
    const now = payload?.conversation?.updatedAt?.trim() || new Date().toISOString();

    const contactRow = {
      id: contactId,
      tenant_id: tenantId,
      name,
      phone: payload?.contact?.phone?.trim() || "—",
      email: payload?.contact?.email?.trim() || null,
      tags: Array.isArray(payload?.contact?.tags) ? payload?.contact?.tags : ["native"],
    } as Record<string, unknown>;

    const { error: contactError } = await admin.from("contacts").upsert(contactRow);
    if (contactError) throw new Error(contactError.message);

    const conversationRow = {
      id: conversationId,
      tenant_id: tenantId,
      contact_id: contactId,
      status: payload?.conversation?.status?.trim() || "new",
      subject,
      last_message_preview: payload?.conversation?.lastMessagePreview?.trim() || body,
      updated_at: now,
    } as Record<string, unknown>;

    const { error: conversationError } = await admin.from("conversations").upsert(conversationRow);
    if (conversationError) throw new Error(conversationError.message);

    const messageRow = {
      id: messageId,
      tenant_id: tenantId,
      conversation_id: conversationId,
      direction: payload?.initialMessage?.direction?.trim() || "inbound",
      body,
      created_at: payload?.initialMessage?.createdAt?.trim() || now,
    } as Record<string, unknown>;

    const { error: messageError } = await admin.from("messages").upsert(messageRow);
    if (messageError) throw new Error(messageError.message);

    return NextResponse.json({ ok: true, conversationId, contactId, messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Native conversation persistence failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
