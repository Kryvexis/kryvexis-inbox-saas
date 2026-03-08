import { NextRequest, NextResponse } from "next/server";
import { normaliseSouthAfricanNumber, sendWhatsAppTextMessage } from "@/lib/meta";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as {
    conversationId?: string;
    messageId?: string;
    to?: string;
    phone?: string;
    body?: string;
    text?: string;
  } | null;

  const conversationId = payload?.conversationId?.trim();
  const messageId = payload?.messageId?.trim();
  const to = payload?.to?.trim() || payload?.phone?.trim();
  const body = payload?.body?.trim() || payload?.text?.trim();

  if (!to || !body) {
    return NextResponse.json({ ok: false, error: "Missing to/phone or body/text" }, { status: 400 });
  }

  try {
    const normalizedTo = normaliseSouthAfricanNumber(to);
    const response = await sendWhatsAppTextMessage({
      to: normalizedTo,
      body,
    });
    const remoteMessageId = response?.messages?.[0]?.id ?? response?.response?.messages?.[0]?.id;

    return NextResponse.json({
      ok: true,
      conversationId,
      messageId,
      remoteMessageId,
      to: normalizedTo,
      response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Meta send error";
    return NextResponse.json({ ok: false, conversationId, messageId, error: message }, { status: 500 });
  }
}
