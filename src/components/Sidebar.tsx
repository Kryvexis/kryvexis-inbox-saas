"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Inbox, Users, Zap, BarChart3, Settings } from "lucide-react";

const items = [
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/contacts", label: "Contacts", icon: Users },
  { href: "/app/automations", label: "Automations", icon: Zap },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-72 shrink-0 border-r border-neutral-200 bg-white">
      <div className="p-4">
        <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="text-sm font-medium">Workspace</div>
          <div className="text-xs text-neutral-500">Kryvexis Inbox System</div>
        </div>

        <nav className="mt-4 space-y-1">
          {items.map((it) => {
            const active = pathname.startsWith(it.href);
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                  active ? "bg-black text-white" : "text-neutral-700 hover:bg-neutral-100"
                )}
              >
                <Icon size={18} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-3xl border border-neutral-200 p-4">
          <div className="text-sm font-semibold">Sample tools</div>
          <div className="mt-1 text-xs text-neutral-500">
            Add sample conversations while you connect the live Meta channel.
          </div>
          <Link
            className="mt-3 inline-block w-full text-center kx-btn kx-btn-primary"
            href="/app/inbox?demo=1"
          >
            Add sample lead
          </Link>
        </div>
      </div>
    </aside>
  );
}
