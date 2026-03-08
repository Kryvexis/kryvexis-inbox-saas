"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import type { ConnectorHealth, MetaConnectionState } from "@/lib/types";

const emptyMeta: MetaConnectionState = {
  configured: false,
  webhookConfigured: false,
  sendEnabled: false,
  mode: "sandbox",
  webhookPath: "/api/meta/webhook",
};

export default function SettingsPage() {
  const { state } = useStore();
  const [meta, setMeta] = useState<MetaConnectionState>(emptyMeta);

  useEffect(() => {
    fetch("/api/meta/status")
      .then((res) => res.json())
      .then((data) => setMeta(data as MetaConnectionState))
      .catch(() => setMeta(emptyMeta));
  }, []);

  const connectors = useMemo<ConnectorHealth[]>(() => ([
    {
      provider: "native",
      enabled: true,
      label: "Kryvexis Inbox Core",
      detail: "Native conversations, portal threads, web chat, and internal workflow stay available without Meta.",
    },
    {
      provider: "meta",
      enabled: meta.sendEnabled,
      label: "Meta / WhatsApp add-on",
      detail: meta.sendEnabled
        ? `Connected in ${meta.mode} mode${meta.phoneNumberId ? ` · phone ${meta.phoneNumberId}` : ""}`
        : "Optional connector — only required for WhatsApp delivery.",
    },
    {
      provider: "none",
      enabled: true,
      label: "Manual / internal threads",
      detail: "Internal notes and manual follow-up keep Inbox usable even when no external connector is active.",
    },
  ]), [meta]);

  const conversationMix = useMemo(() => ({
    native: state.conversations.filter((c) => c.provider === "native").length,
    meta: state.conversations.filter((c) => c.provider === "meta").length,
    none: state.conversations.filter((c) => c.provider === "none").length,
  }), [state.conversations]);

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-neutral-500">Configure Kryvexis Inbox Core first, then enable external messaging providers as optional add-ons.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-3 text-sm text-neutral-600">
            <div>Name: <b>Kryvexis Inbox System</b></div>
            <div className="mt-1">Core mode: <b>Native Inbox CRM</b></div>
            <div className="mt-1">Provider strategy: <b>Optional connector add-ons</b></div>
          </div>
        </div>

        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Team</div>
          <div className="mt-3 space-y-2">
            {state.team.map((m) => (
              <div key={m.id} className="rounded-2xl border border-neutral-200 p-3 text-sm">
                <div className="font-medium">{m.name}</div>
                <div className="text-neutral-500">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Connectors</div>
          <div className="mt-4 grid gap-3 text-sm">
            {connectors.map((connector) => (
              <div key={connector.label} className="rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{connector.label}</span>
                  <span className="kx-badge">{connector.enabled ? "Enabled" : "Optional"}</span>
                </div>
                <div className="mt-2 text-neutral-600">{connector.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Conversation mix</div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Inbox core</span><span className="kx-badge">{conversationMix.native}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Meta add-on</span><span className="kx-badge">{conversationMix.meta}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Manual / internal</span><span className="kx-badge">{conversationMix.none}</span></div>
            <div className="rounded-2xl border border-neutral-200 p-3 text-neutral-600">
              Webhook path for Meta add-on: <b>{meta.webhookPath}</b>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Meta add-on details</div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Access token</span><span className="kx-badge">{meta.configured ? "Detected" : "Missing"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Phone number ID</span><span className="kx-badge">{meta.phoneNumberId ? meta.phoneNumberId : "Missing"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Business account ID</span><span className="kx-badge">{meta.businessAccountId ? meta.businessAccountId : "Optional"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Webhook verify token</span><span className="kx-badge">{meta.webhookConfigured ? "Configured" : "Missing"}</span></div>
          </div>
        </div>

        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Connector checklist</div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-600">
            <li>Keep Inbox Core usable without any external provider.</li>
            <li>Only enable Meta for WhatsApp-specific conversations.</li>
            <li>Store provider message IDs for later delivery reconciliation.</li>
            <li>Show provider health separately from the core workspace health.</li>
            <li>Add more providers later without rewriting the Inbox UI.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
