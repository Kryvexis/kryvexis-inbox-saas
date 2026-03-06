import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, MessageSquareMore, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

const features = [
  "Shared inbox with CRM context",
  "Quotes, products and fast sales workflows",
  "Mobile-friendly layout with focused controls"
];

export default function Home() {
  return (
    <main className="kx-shell">
      <div className="kx-container py-6 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex kx-badge">Showcase ready</span>
            <Link href="/app/inbox" className="kx-btn kx-btn-primary">Open product</Link>
          </div>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="kx-badge-dark"><Sparkles size={12} /> Premium CRM demo</span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              A sharper inbox UI that looks great on desktop and stays focused on mobile.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-neutral-600 sm:text-lg">
              Kryvexis Inbox brings together conversations, quotes, products, automations and analytics in one cleaner SaaS-style experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/inbox" className="kx-btn kx-btn-primary px-5 py-3">
                Launch showcase <ArrowRight size={16} />
              </Link>
              <span className="kx-badge">No external APIs required</span>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature} className="kx-card2 p-4 text-sm text-neutral-700">
                  <CheckCircle2 className="mb-3" size={18} />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="kx-card p-4 sm:p-6">
            <div className="grid gap-4 rounded-[24px] bg-neutral-950 p-4 text-white sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">Today</div>
                  <div className="mt-2 text-xl font-semibold">Live workflow snapshot</div>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Demo mode</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/8 p-4">
                  <MessageSquareMore size={18} className="text-white/75" />
                  <div className="mt-4 text-2xl font-semibold">14</div>
                  <div className="text-sm text-white/65">Open customer conversations</div>
                </div>
                <div className="rounded-3xl bg-white/8 p-4">
                  <Layers3 size={18} className="text-white/75" />
                  <div className="mt-4 text-2xl font-semibold">8</div>
                  <div className="text-sm text-white/65">Active quotes in progress</div>
                </div>
              </div>
              <div className="grid gap-3">
                {[
                  ["New lead", "Sipho asked for pricing and turnaround time."],
                  ["Rule fired", "Keyword price sent the instant reply."],
                  ["Quote sent", "R2,499 quote prepared from the conversation."]
                ].map(([title, description]) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-white/6 p-4">
                    <div className="font-medium">{title}</div>
                    <div className="mt-1 text-sm text-white/65">{description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
