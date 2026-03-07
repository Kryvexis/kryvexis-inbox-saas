import { NextRequest, NextResponse } from "next/server";
import { normaliseSouthAfricanNumber, sendWhatsAppTextMessage } from "@/lib/meta";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null) as { to?: string; body?: string } | null;

  if (!payload?.to || !payload?.body) {
    return NextResponse.json({ error: "Missing to or body" }, { status: 400 });
  }

  try {
    const response = await sendWhatsAppTextMessage({
      to: normaliseSouthAfricanNumber(payload.to),
      body: payload.body,
    });

    return NextResponse.json({ ok: true, response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Meta send error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
