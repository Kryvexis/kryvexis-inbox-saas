"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/components/StoreProvider";
import type { MetaConnectionState } from "@/lib/types";

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

  const counts = useMemo(() => ({
    inboxCore: state.conversations.filter((c) => c.provider === "native").length,
    metaAddon: state.conversations.filter((c) => c.provider === "meta").length,
  }), [state.conversations]);

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-neutral-500">Kryvexis Inbox Core runs natively. Meta / WhatsApp is shown here as an optional connector.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-3 text-sm text-neutral-600">
            <div>Name: <b>Kryvexis Inbox System</b></div>
            <div className="mt-1">Inbox Core: <b>Active</b></div>
            <div className="mt-1">Native conversations: <b>{counts.inboxCore}</b></div>
            <div className="mt-1">Meta add-on threads: <b>{counts.metaAddon}</b></div>
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
          <div className="text-sm font-semibold">Connector: Meta / WhatsApp</div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Connector status</span><span className="kx-badge">{meta.sendEnabled ? "Connected" : "Disconnected"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Access token</span><span className="kx-badge">{meta.configured ? "Detected" : "Missing"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Phone number ID</span><span className="kx-badge">{meta.phoneNumberId ? meta.phoneNumberId : "Missing"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Webhook verify token</span><span className="kx-badge">{meta.webhookConfigured ? "Configured" : "Missing"}</span></div>
            <div className="rounded-2xl border border-neutral-200 p-3 text-neutral-600">
              Webhook path: <b>{meta.webhookPath}</b>
            </div>
          </div>
        </div>

        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Native-first rollout</div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-600">
            <li>Use Inbox Core for manual and web conversations first.</li>
            <li>Keep every message in Kryvexis even if Meta is disconnected.</li>
            <li>Treat WhatsApp as an optional delivery add-on, not the main system.</li>
            <li>Reconnect Meta only when outbound WhatsApp is needed.</li>
            <li>Add more connectors later without changing the core inbox flow.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
