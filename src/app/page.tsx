import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="kx-shell">
      <div className="kx-container py-10">
        <header className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/app/inbox" className="kx-btn kx-btn-primary">Open product</Link>
          </div>
        </header>

        <section className="mt-16 grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">
              A clean product you can actually show people.
            </h1>
            <p className="mt-5 text-lg text-neutral-600">
              Inbox, CRM, automations, analytics, quotes, products, and team workflows — all in one polished SaaS shell.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/inbox" className="kx-btn kx-btn-primary px-5 py-3">Launch showcase</Link>
              <span className="kx-badge">No external APIs required</span>
            </div>
          </div>

          <div className="kx-card p-6">
            <div className="kx-card2 p-5">
              <div className="text-sm font-semibold">Today</div>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="font-medium">New lead: Sipho</div>
                  <div className="text-sm text-neutral-600">Wants pricing + delivery options.</div>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="font-medium">Automation fired</div>
                  <div className="text-sm text-neutral-600">Keyword “price” sent the canned reply.</div>
                </div>
                <div className="rounded-2xl border border-neutral-200 p-4">
                  <div className="font-medium">Quote sent</div>
                  <div className="text-sm text-neutral-600">R2,499 proposal sent to lead.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
