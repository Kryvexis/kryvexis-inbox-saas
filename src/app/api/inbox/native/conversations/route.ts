import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/data";
import { getServerSupabaseAdmin } from "@/lib/serverSupabaseAdmin";

type NativeConversationPayload = {
  contact?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string | null;
    tags?: string[];
  };
  conversation?: {
    id?: string;
    subject?: string;
    status?: string;
    lastMessagePreview?: string;
    updatedAt?: string;
    channel?: string;
    priority?: string;
    labels?: string[];
  };
  initialMessage?: {
    id?: string;
    body?: string;
    direction?: string;
    createdAt?: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const profile = await getProfile();
    const tenantId = profile?.tenant_id ?? null;
    if (!tenantId) {
      return NextResponse.json({ ok: false, error: "Tenant not found" }, { status: 401 });
    }

    const admin = getServerSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Supabase admin is not configured" }, { status: 500 });
    }

    const payload = (await request.json().catch(() => null)) as NativeConversationPayload | null;
    const name = payload?.contact?.name?.trim() || "Unknown";
    const subject = payload?.conversation?.subject?.trim() || "Native Inbox conversation";
    const body = payload?.initialMessage?.body?.trim() || "";

    if (!body) {
      return NextResponse.json({ ok: false, error: "Initial message body is required" }, { status: 400 });
    }

    const now = payload?.conversation?.updatedAt?.trim() || new Date().toISOString();
    const contactId = payload?.contact?.id?.trim() || `c_${crypto.randomUUID()}`;
    const conversationId = payload?.conversation?.id?.trim() || `v_${crypto.randomUUID()}`;
    const messageId = payload?.initialMessage?.id?.trim() || `m_${crypto.randomUUID()}`;

    const contactsTable = admin.from("contacts") as any;
    const conversationsTable = admin.from("conversations") as any;
    const messagesTable = admin.from("messages") as any;

    const contactRow = {
      id: contactId,
      tenant_id: tenantId,
      name,
      phone: payload?.contact?.phone?.trim() || "—",
      email: payload?.contact?.email?.trim() || null,
      tags: Array.isArray(payload?.contact?.tags) ? payload.contact!.tags : ["native"],
    };

    const { error: contactError } = await contactsTable.upsert(contactRow);
    if (contactError) throw new Error(contactError.message);

    const conversationRow = {
      id: conversationId,
      tenant_id: tenantId,
      contact_id: contactId,
      status: payload?.conversation?.status?.trim() || "new",
      subject,
      last_message_preview: payload?.conversation?.lastMessagePreview?.trim() || body,
      updated_at: now,
    };

    const { error: conversationError } = await conversationsTable.upsert(conversationRow);
    if (conversationError) throw new Error(conversationError.message);

    const messageRow = {
      id: messageId,
      tenant_id: tenantId,
      conversation_id: conversationId,
      direction: payload?.initialMessage?.direction?.trim() || "inbound",
      body,
      created_at: payload?.initialMessage?.createdAt?.trim() || now,
    };

    const { error: messageError } = await messagesTable.upsert(messageRow);
    if (messageError) throw new Error(messageError.message);

    return NextResponse.json({
      ok: true,
      tenantId,
      contactId,
      conversationId,
      messageId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Native conversation persistence failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
