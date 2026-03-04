import Link from "next/link";
import { TopNav } from "@/components/TopNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <TopNav />
      <div className="kx-container py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">
              The cleanest team inbox for customer messaging.
            </h1>
            <p className="mt-5 text-lg text-neutral-600">
              Assign chats, keep context, ship quotes faster, and close more sales.
              Built for WhatsApp-first businesses (API later).
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="kx-btn kx-btn-primary px-5 py-3" href="/signup">
                Create account
              </Link>
              <Link className="kx-btn kx-btn-ghost px-5 py-3 border border-neutral-200" href="/login">
                Sign in
              </Link>
              <Link className="kx-btn kx-btn-ghost px-5 py-3 border border-neutral-200" href="/app/inbox">
                Open app
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-2 text-sm text-neutral-500">
              <span className="kx-badge">Inbox</span>
              <span className="kx-badge">CRM</span>
              <span className="kx-badge">Automations</span>
              <span className="kx-badge">Analytics</span>
              <span className="kx-badge">Vercel-ready</span>
            </div>
          </div>

          <div className="kx-card p-6 bg-neutral-50">
            <div className="kx-card2 p-5">
              <div className="text-sm font-semibold">Live workspace preview</div>
              <div className="mt-3 grid gap-3">
                {[
                  { title: "New lead: Sipho", desc: "Wants pricing + delivery options." },
                  { title: "Follow-up due", desc: "2 customers waiting on quotes." },
                  { title: "Team activity", desc: "Assigned 4 chats to agents." },
                ].map((x) => (
                  <div key={x.title} className="rounded-2xl border border-neutral-200 p-4 bg-white">
                    <div className="font-medium">{x.title}</div>
                    <div className="text-sm text-neutral-600">{x.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-neutral-500">
              Start without APIs. Inject demo messages. When ready, connect WhatsApp Cloud API.
            </div>
          </div>
        </div>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Close faster",
              desc: "All conversations, assignments, and follow-ups in one place.",
            },
            {
              title: "Keep context",
              desc: "CRM profiles, tags, internal notes, and clean history.",
            },
            {
              title: "Automate outcomes",
              desc: "Keyword rules, canned replies, and SLA-based workflows.",
            },
          ].map((f) => (
            <div key={f.title} className="kx-card2 p-6">
              <div className="text-lg font-semibold">{f.title}</div>
              <div className="mt-2 text-sm text-neutral-600">{f.desc}</div>
            </div>
          ))}
        </section>

        <footer className="mt-16 text-sm text-neutral-500">
          © {new Date().getFullYear()} Kryvexis — Inbox SaaS
        </footer>
      </div>
    </main>
  );
}
