import { NextRequest, NextResponse } from "next/server";
import { normaliseSouthAfricanNumber, sendWhatsAppTextMessage } from "@/lib/meta";

type MetaSendRequest = {
  conversationId?: string;
  messageId?: string;
  to?: string;
  phone?: string;
  body?: string;
  text?: string;
};

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as MetaSendRequest | null;

  const conversationId = payload?.conversationId?.trim();
  const messageId = payload?.messageId?.trim();
  const rawTo = payload?.to?.trim() || payload?.phone?.trim();
  const body = payload?.body?.trim() || payload?.text?.trim();

  if (!rawTo || !body) {
    return NextResponse.json({ ok: false, error: "Missing 'to' and/or 'body'" }, { status: 400 });
  }

  try {
    const to = normaliseSouthAfricanNumber(rawTo);
    const response = await sendWhatsAppTextMessage({ to, body });
    const remoteMessageId = response?.messages?.[0]?.id;

    return NextResponse.json({
      ok: true,
      conversationId,
      messageId,
      to,
      remoteMessageId,
      response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Meta send failed";
    console.error("[meta/send] send failure", { conversationId, messageId, rawTo, message });
    return NextResponse.json({ ok: false, conversationId, messageId, error: message }, { status: 500 });
  }
}
