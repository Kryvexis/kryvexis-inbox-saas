"use client";

import { useStore } from "@/components/StoreProvider";

export default function SettingsPage() {
  const { state } = useStore();

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-neutral-500">Workspace details, team access, and operating mode.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="kx-card2 p-6">
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-3 text-sm text-neutral-600">
            <div>Name: <b>Kryvexis Inbox</b></div>
            <div className="mt-1">Plan: <b>Business Workspace</b></div>
            <div className="mt-1">Mode: <b>Local data mode</b></div>
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
    </div>
  );
}
