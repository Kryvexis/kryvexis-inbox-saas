"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, FileText, Inbox, Plus, Settings, Users, Zap } from "lucide-react";
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

const mobileItems = items.filter((item) => ["/app/inbox", "/app/quotes", "/app/products", "/app/settings"].includes(item.href));

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { injectLead, state } = useStore();

  const openCount = state.conversations.filter((c) => c.status === "open").length;
  const pendingCount = state.conversations.filter((c) => c.status === "pending").length;

  return (
    <div className="kx-shell kx-mobile-safe">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-[#f5f7fb]/90 backdrop-blur-xl">
        <div className="kx-container py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/app/inbox" className="hover:opacity-90">
              <Logo />
            </Link>
            <div className="hidden items-center gap-3 md:flex">
              <span className="kx-badge">{openCount} open</span>
              <span className="kx-badge">{pendingCount} pending</span>
              <button className="kx-btn kx-btn-primary" onClick={injectLead}>
                <Plus size={16} /> Inject lead
              </button>
            </div>
            <button className="kx-btn kx-btn-primary md:hidden" onClick={injectLead}>
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 overflow-auto md:hidden">
            <span className="kx-badge-dark">Kryvexis Inbox</span>
            <span className="kx-badge">{openCount} open</span>
            <span className="kx-badge">{state.quotes.length} quotes</span>
          </div>
        </div>
      </header>

      <div className="kx-container py-4 sm:py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <div className="kx-card p-4">
                <div className="rounded-[24px] bg-neutral-950 p-5 text-white">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/55">Workspace</div>
                  <div className="mt-2 text-lg font-semibold">Kryvexis Inbox</div>
                  <div className="mt-1 text-sm text-white/70">Fast sales inbox, catalog, quotes and automation views.</div>
                </div>

                <nav className="mt-4 space-y-1.5">
                  {items.map((it) => {
                    const Icon = it.icon;
                    const active = pathname.startsWith(it.href);
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className={active
                          ? "flex items-center gap-3 rounded-[20px] bg-neutral-950 px-4 py-3 text-sm font-medium text-white"
                          : "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-100"}
                      >
                        <Icon size={18} />
                        {it.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="kx-card2 p-4">
                <div className="kx-panel-title">Today</div>
                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl bg-neutral-50 p-3">
                    <div className="text-sm font-medium">{state.contacts.length} contacts</div>
                    <div className="text-xs text-neutral-500">Stored in your showcase CRM.</div>
                  </div>
                  <div className="rounded-2xl bg-neutral-50 p-3">
                    <div className="text-sm font-medium">{state.products.length} catalog items</div>
                    <div className="text-xs text-neutral-500">Ready to quote and demo.</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
          {mobileItems.map((it) => {
            const Icon = it.icon;
            const active = pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={active
                  ? "flex flex-col items-center gap-1 rounded-2xl bg-neutral-950 px-2 py-2 text-[11px] font-medium text-white"
                  : "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-neutral-500"}
              >
                <Icon size={18} />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
