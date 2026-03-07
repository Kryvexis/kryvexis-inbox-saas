from pathlib import Path
p = Path('/tmp/inboxmeta/src/app/app/settings/page.tsx')
p.write_text('''"use client";

import { useEffect, useState } from "react";
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

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-neutral-500">Workspace details, team overview, and Meta API connection status.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-3 text-sm text-neutral-600">
            <div>Name: <b>Kryvexis Inbox System</b></div>
            <div className="mt-1">Mode: <b>{meta.mode === "live" ? "Live connection" : "Meta-ready workspace"}</b></div>
            <div className="mt-1">Messaging: <b>{meta.sendEnabled ? "Ready to send via Meta" : "Waiting for Meta credentials"}</b></div>
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
          <div className="text-sm font-semibold">Meta API connection</div>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Access token</span><span className="kx-badge">{meta.configured ? "Detected" : "Missing"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Phone number ID</span><span className="kx-badge">{meta.phoneNumberId ? meta.phoneNumberId : "Missing"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Business account ID</span><span className="kx-badge">{meta.businessAccountId ? meta.businessAccountId : "Optional"}</span></div>
            <div className="flex items-center justify-between rounded-2xl border border-neutral-200 p-3"><span>Webhook verify token</span><span className="kx-badge">{meta.webhookConfigured ? "Configured" : "Missing"}</span></div>
            <div className="rounded-2xl border border-neutral-200 p-3 text-neutral-600">
              Webhook path: <b>{meta.webhookPath}</b>
            </div>
          </div>
        </div>

        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Connection checklist</div>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-600">
            <li>Add Meta credentials to your Vercel environment variables.</li>
            <li>Set the webhook callback to <b>{meta.webhookPath}</b>.</li>
            <li>Use the same verify token in Meta and Vercel.</li>
            <li>Redeploy after saving your environment variables.</li>
            <li>Test inbound and outbound WhatsApp messaging.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
''')
