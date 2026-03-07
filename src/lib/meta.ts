import type { MetaConnectionState } from "@/lib/types";

const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? "v23.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function getMetaConnectionState(): MetaConnectionState {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const businessAccountId = process.env.META_BUSINESS_ACCOUNT_ID;
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  return {
    configured: Boolean(accessToken && phoneNumberId),
    webhookConfigured: Boolean(verifyToken),
    sendEnabled: Boolean(accessToken && phoneNumberId),
    mode: (process.env.META_MODE === "live" ? "live" : "sandbox"),
    phoneNumberId,
    businessAccountId,
    webhookPath: "/api/meta/webhook",
  };
}

export function getMetaWebhookVerifyToken() {
  return process.env.META_WEBHOOK_VERIFY_TOKEN ?? "";
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function sendWhatsAppTextMessage(args: {
  to: string;
  body: string;
  previewUrl?: boolean;
}) {
  const phoneNumberId = getRequiredEnv("META_PHONE_NUMBER_ID");
  const accessToken = getRequiredEnv("META_ACCESS_TOKEN");

  const response = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: args.to,
      type: "text",
      text: {
        preview_url: args.previewUrl ?? false,
        body: args.body,
      },
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.error?.message || "Meta API request failed";
    throw new Error(message);
  }

  return payload;
}

export function normaliseSouthAfricanNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}
