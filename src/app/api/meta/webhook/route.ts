import { NextRequest, NextResponse } from "next/server";
import { getMetaWebhookVerifyToken, normaliseIncomingMetaNumber } from "@/lib/meta";
import { getServerSupabaseAdmin } from "@/lib/serverSupabaseAdmin";

function extractInboundMessages(payload: any) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  const rows: Array<{ wamid: string; phone: string; contactName: string | null; body: string; receivedAt: string; metadata: any }> = [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value;
      const contacts = Array.isArray(value?.contacts) ? value.contacts : [];
      const messages = Array.isArray(value?.messages) ? value.messages : [];
      const contactName = contacts[0]?.profile?.name ?? null;
      for (const message of messages) {
        const body = message?.text?.body;
        const from = message?.from;
        if (!body || !from) continue;
        rows.push({
          wamid: message?.id ?? `${from}-${message?.timestamp ?? Date.now()}`,
          phone: normaliseIncomingMetaNumber(String(from)),
          contactName,
          body: String(body),
          receivedAt: message?.timestamp ? new Date(Number(message.timestamp) * 1000).toISOString() : new Date().toISOString(),
          metadata: {
            entryId: entry?.id ?? null,
            changeField: change?.field ?? null,
            rawMessage: message,
            rawContacts: contacts,
          },
        });
      }
    }
  }

  return rows;
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const mode = search.get("hub.mode");
  const token = search.get("hub.verify_token");
  const challenge = search.get("hub.challenge");

  if (mode === "subscribe" && token === getMetaWebhookVerifyToken()) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const rows = extractInboundMessages(body);

  if (!rows.length) {
    return NextResponse.json({ received: true, stored: 0, ignored: true });
  }

  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    console.log("[meta-webhook] inbound payload", JSON.stringify(body));
    return NextResponse.json({ received: true, stored: 0, warning: "Supabase admin not configured" });
  }

  const payload: Record<string, unknown>[] = rows.map((row) => ({
    wamid: row.wamid,
    phone: row.phone,
    contact_name: row.contactName,
    body: row.body,
    received_at: row.receivedAt,
    metadata: row.metadata,
  }));

  const { error } = await supabase
    .from("meta_incoming_messages")
    .upsert(payload as never, { onConflict: "wamid", ignoreDuplicates: false });

  if (error) {
    console.error("[meta-webhook] store failed", error.message);
    return NextResponse.json({ received: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, stored: rows.length });
}
