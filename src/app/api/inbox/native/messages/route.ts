import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/data";
import { getServerSupabaseAdmin } from "@/lib/serverSupabaseAdmin";

type NativeMessagePayload = {
  conversationId?: string;
  message?: {
    id?: string;
    direction?: "inbound" | "outbound" | "internal" | string;
    body?: string;
    createdAt?: string;
  };
};

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getProfile();
    const tenantId = profile?.tenant_id ?? null;

    if (!tenantId) {
      return NextResponse.json({ ok: false, error: "No tenant found" }, { status: 401 });
    }

    const admin = getServerSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Supabase admin is not configured" }, { status: 500 });
    }

    const payload = (await request.json().catch(() => null)) as NativeMessagePayload | null;
    const conversationId = payload?.conversationId?.trim();
    const body = payload?.message?.body?.trim();

    if (!conversationId || !body) {
      return NextResponse.json(
        { ok: false, error: "Missing conversationId or message body" },
        { status: 400 }
      );
    }

    const messageId = payload?.message?.id?.trim() || createId("msg");
    const direction = payload?.message?.direction?.trim() || "outbound";
    const createdAt = payload?.message?.createdAt?.trim() || new Date().toISOString();

    const messagesTable = admin.from("messages") as any;
    const messageRow = {
      id: messageId,
      tenant_id: tenantId,
      conversation_id: conversationId,
      direction,
      body,
      created_at: createdAt,
    } as any;

    const { error: messageError } = await messagesTable.upsert(messageRow);
    if (messageError) throw new Error(messageError.message);

    const conversationsTable = admin.from("conversations") as any;
    const { error: conversationError } = await conversationsTable.upsert({
      id: conversationId,
      tenant_id: tenantId,
      last_message_preview: body,
      updated_at: createdAt,
    } as any);
    if (conversationError) throw new Error(conversationError.message);

    return NextResponse.json({
      ok: true,
      conversationId,
      messageId,
      persisted: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown native message persistence error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
