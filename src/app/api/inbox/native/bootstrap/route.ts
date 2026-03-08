import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/serverSupabaseAdmin";
import { supabaseServer } from "@/lib/supabase/server";
import type { AppState, Contact, Conversation, Message } from "@/lib/types";

async function getTenantId() {
  const ssr = await supabaseServer();
  const { data: userData } = await ssr.auth.getUser();
  if (!userData.user) return null;

  const admin = getServerSupabaseAdmin();
  if (!admin) return null;

  const { data } = await admin
    .from("profiles")
    .select("tenant_id")
    .eq("id", userData.user.id)
    .maybeSingle();

  return (data?.tenant_id as string | null) ?? null;
}

export async function GET() {
  try {
    const admin = getServerSupabaseAdmin();
    const tenantId = await getTenantId();

    if (!admin || !tenantId) {
      return NextResponse.json({ ok: false, reason: "Tenant persistence unavailable" }, { status: 200 });
    }

    const [{ data: contactsRows, error: contactsError }, { data: conversationRows, error: conversationError }] = await Promise.all([
      admin
        .from("contacts")
        .select("id, name, phone, email, tags")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("conversations")
        .select("id, contact_id, status, subject, last_message_preview, updated_at, assigned_to")
        .eq("tenant_id", tenantId)
        .order("updated_at", { ascending: false })
        .limit(100),
    ]);

    if (contactsError) throw new Error(contactsError.message);
    if (conversationError) throw new Error(conversationError.message);

    const conversationIds = (conversationRows ?? []).map((row) => row.id as string);
    let messagesRows: Array<Record<string, unknown>> = [];
    if (conversationIds.length) {
      const { data, error } = await admin
        .from("messages")
        .select("id, conversation_id, direction, body, created_at")
        .eq("tenant_id", tenantId)
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: true })
        .limit(1000);
      if (error) throw new Error(error.message);
      messagesRows = data ?? [];
    }

    const contacts: Contact[] = (contactsRows ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name ?? "Unknown"),
      phone: String(row.phone ?? "—"),
      email: row.email ? String(row.email) : undefined,
      tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag)) : ["native"],
    }));

    const messagesByConversation = new Map<string, Message[]>();
    for (const row of messagesRows) {
      const conversationId = String(row.conversation_id);
      const message: Message = {
        id: String(row.id),
        direction: String(row.direction) === "inbound" ? "inbound" : String(row.direction) === "internal" ? "internal" : "outbound",
        body: String(row.body ?? ""),
        createdAt: String(row.created_at ?? new Date().toISOString()),
        channel: "manual",
        provider: "native",
        author: String(row.direction) === "inbound" ? "Customer" : "Agent",
        deliveryState: String(row.direction) === "outbound" ? "sent" : undefined,
      };
      const existing = messagesByConversation.get(conversationId) ?? [];
      existing.push(message);
      messagesByConversation.set(conversationId, existing);
    }

    const conversations: Conversation[] = (conversationRows ?? []).map((row) => ({
      id: String(row.id),
      contactId: String(row.contact_id),
      status: (String(row.status ?? "open") as Conversation["status"]),
      assignedTo: row.assigned_to ? String(row.assigned_to) : undefined,
      subject: String(row.subject ?? "Native Inbox conversation"),
      lastMessagePreview: String(row.last_message_preview ?? ""),
      updatedAt: String(row.updated_at ?? new Date().toISOString()),
      messages: messagesByConversation.get(String(row.id)) ?? [],
      notes: [],
      channel: "manual",
      provider: "native",
      unreadCount: 0,
      priority: "medium",
      labels: ["native", "persisted"],
      persisted: true,
    }));

    const partialState: Partial<AppState> = { contacts, conversations };
    return NextResponse.json({ ok: true, state: partialState });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bootstrap failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
