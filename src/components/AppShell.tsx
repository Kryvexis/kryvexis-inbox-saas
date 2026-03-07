"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, FileText, Inbox, Settings, Users, Zap } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "./StoreProvider";

const items = [
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/contacts", label: "Contacts", icon: Users },
  { href: "/app/quotes", label: "Quotes", icon: FileText },
  { href: "/app/products", label: "Products", icon: Boxes },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/automations", label: "Automations", icon: Zap },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { injectLead, state } = useStore();
  const openCount = state.conversations.filter((c) => c.status !== "closed").length;

  return (
    <div className="kx-shell">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="kx-container flex items-center justify-between gap-4 py-4">
          <Link href="/" className="hover:opacity-90">
            <Logo />
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <span className="kx-badge">Workspace active</span>
            <span className="text-sm text-neutral-500">{openCount} active conversations</span>
            <button className="kx-btn kx-btn-primary" onClick={injectLead}>Add sample lead</button>
          </div>
          <button className="kx-btn kx-btn-primary md:hidden" onClick={injectLead}>Sample lead</button>
        </div>
      </header>

      <div className="kx-container pb-24 pt-5 md:py-6">
        <div className="flex gap-6">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="kx-card2 p-3">
              <div className="text-sm font-semibold">Kryvexis Inbox System</div>
              <div className="mt-1 text-sm text-neutral-500">Customer conversations, quotes, and follow-up in one workspace.</div>
            </div>

            <nav className="mt-4 space-y-1">
              {items.map((it) => {
                const Icon = it.icon;
                const active = pathname === it.href;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={active
                      ? "flex items-center gap-3 rounded-2xl bg-black px-3 py-3 text-sm font-medium text-white"
                      : "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100"}
                  >
                    <Icon size={18} />
                    {it.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          {items.slice(0, 5).map((it) => {
            const Icon = it.icon;
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={active
                  ? "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl bg-black px-2 py-2 text-[11px] font-medium text-white"
                  : "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-neutral-500"}
              >
                <Icon size={18} />
                <span className="truncate">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
