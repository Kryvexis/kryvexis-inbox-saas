import { NextRequest, NextResponse } from "next/server";
import { getMetaWebhookVerifyToken } from "@/lib/meta";

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
  console.log("[meta-webhook] inbound payload", JSON.stringify(body));
  return NextResponse.json({ received: true });
}
