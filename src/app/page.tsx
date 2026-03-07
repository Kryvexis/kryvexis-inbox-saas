import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="kx-shell">
      <div className="kx-container py-8 md:py-12">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <Link href="/app/inbox" className="kx-btn kx-btn-primary">Open workspace</Link>
        </header>

        <section className="mt-12 grid gap-8 md:mt-16 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <div className="kx-badge">Kryvexis Inbox System</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              One calm workspace for customer messages, quotes, and follow-up.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-neutral-600 md:text-lg">
              Manage conversations, customer details, products, and sales activity in one simple workspace built for day-to-day use.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/app/inbox" className="kx-btn kx-btn-primary px-5 py-3">Launch workspace</Link>
              <span className="kx-badge">Ready for live teams</span>
            </div>
          </div>

          <div className="kx-card p-4 md:p-6">
            <div className="grid gap-3">
              <div className="kx-card2 p-4">
                <div className="text-sm font-semibold">Customer inbox</div>
                <div className="mt-1 text-sm text-neutral-600">Keep new leads, open chats, and follow-up in one shared view.</div>
              </div>
              <div className="kx-card2 p-4">
                <div className="text-sm font-semibold">Quote tracking</div>
                <div className="mt-1 text-sm text-neutral-600">Move from conversation to quote without leaving the workspace.</div>
              </div>
              <div className="kx-card2 p-4">
                <div className="text-sm font-semibold">Team workflow</div>
                <div className="mt-1 text-sm text-neutral-600">Assign conversations, keep notes, and keep customer work organized.</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
