import { NextRequest, NextResponse } from "next/server";
import { normaliseSouthAfricanNumber, sendWhatsAppTextMessage } from "@/lib/meta";

type MetaSendRequest = {
  conversationId?: string;
  messageId?: string;
  to?: string;
  body?: string;
  phone?: string;
  text?: string;
};

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as MetaSendRequest | null;

  const conversationId = payload?.conversationId?.trim();
  const messageId = payload?.messageId?.trim();
  const rawTo = payload?.to?.trim() || payload?.phone?.trim();
  const rawBody = payload?.body?.trim() || payload?.text?.trim();

  if (!rawTo || !rawBody) {
    return NextResponse.json({ ok: false, error: "Missing to or body" }, { status: 400 });
  }

  try {
    const to = normaliseSouthAfricanNumber(rawTo);
    const response = await sendWhatsAppTextMessage({ to, body: rawBody });
    const remoteMessageId = response?.messages?.[0]?.id || response?.response?.messages?.[0]?.id || undefined;

    return NextResponse.json({
      ok: true,
      conversationId,
      messageId,
      to,
      remoteMessageId,
      response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Meta send error";
    return NextResponse.json({ ok: false, conversationId, messageId, error: message }, { status: 500 });
  }
}
