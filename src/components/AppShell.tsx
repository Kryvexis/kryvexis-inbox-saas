"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, FileText, Inbox, Settings, Users, Zap } from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "./StoreProvider";

const items = [
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/contacts", label: "Contacts", icon: Users },
  { href: "/app/automations", label: "Automations", icon: Zap },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/quotes", label: "Quotes", icon: FileText },
  { href: "/app/products", label: "Products", icon: Boxes },
  { href: "/app/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { injectLead, state } = useStore();
  const openCount = state.conversations.filter((conversation) => conversation.status === "open").length;
  const quoteValue = state.quotes.reduce((sum, quote) => sum + quote.total, 0);

  return (
    <div className="kx-shell">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="kx-container flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="hover:opacity-90">
            <Logo />
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className="kx-badge">{openCount} open inbox threads</span>
            <span className="kx-badge">R {quoteValue.toLocaleString()} quote value</span>
            <button className="kx-btn kx-btn-primary" onClick={injectLead}>Inject demo lead</button>
          </div>
        </div>
      </header>

      <div className="kx-container flex gap-6 py-6">
        <aside className="hidden w-72 shrink-0 border-r border-neutral-200 bg-white md:block">
          <div className="p-4">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-sm font-medium">Workspace</div>
              <div className="text-xs text-neutral-500">Kryvexis Inbox</div>
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
                      ? "flex items-center gap-3 rounded-2xl bg-black px-3 py-2 text-sm font-medium text-white"
                      : "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"}
                  >
                    <Icon size={18} />
                    {it.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
