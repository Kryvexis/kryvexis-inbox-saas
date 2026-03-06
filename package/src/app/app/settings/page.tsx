"use client";

import { useStore } from "@/components/StoreProvider";

export default function SettingsPage() {
  const { state } = useStore();

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-neutral-500">Workspace details, team access, and channel readiness overview.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-3 text-sm text-neutral-600">
            <div>Name: <b>Kryvexis Inbox System</b></div>
            <div className="mt-1">Mode: <b>Meta-ready workspace</b></div>
            <div className="mt-1">Channels prepared: <b>WhatsApp, Web, Manual</b></div>
          </div>
        </div>

        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Team</div>
          <div className="mt-3 space-y-2">
            {state.team.map((member) => (
              <div key={member.id} className="rounded-2xl border border-neutral-200 p-3 text-sm">
                <div className="font-medium">{member.name}</div>
                <div className="text-neutral-500">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
