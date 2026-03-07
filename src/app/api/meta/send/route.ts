import { NextRequest, NextResponse } from "next/server";
import { normaliseSouthAfricanNumber, sendWhatsAppTextMessage } from "@/lib/meta";

type SendPayload = {
  to?: string;
  phone?: string;
  body?: string;
  text?: string;
  conversationId?: string;
  messageId?: string;
};

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as SendPayload | null;
  const to = String(payload?.to ?? payload?.phone ?? "").trim();
  const body = String(payload?.body ?? payload?.text ?? "").trim();

  if (!to || !body) {
    return NextResponse.json(
      { ok: false, error: "Missing to or body" },
      { status: 400 },
    );
  }

  try {
    const response = await sendWhatsAppTextMessage({
      to: normaliseSouthAfricanNumber(to),
      body,
    });

    return NextResponse.json({
      ok: true,
      to: normaliseSouthAfricanNumber(to),
      messageId: payload?.messageId ?? null,
      conversationId: payload?.conversationId ?? null,
      response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Meta send error";
    console.error("[meta-send] failed", {
      to: normaliseSouthAfricanNumber(to),
      conversationId: payload?.conversationId ?? null,
      messageId: payload?.messageId ?? null,
      error: message,
    });
    return NextResponse.json(
      {
        ok: false,
        error: message,
        to: normaliseSouthAfricanNumber(to),
        conversationId: payload?.conversationId ?? null,
        messageId: payload?.messageId ?? null,
      },
      { status: 500 },
    );
  }
}
