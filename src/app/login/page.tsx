"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const sp = useSearchParams();
  const next = sp.get("next") || "/app/inbox";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    window.location.href = next;
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="kx-container py-12 max-w-md">
        <Link href="/" className="text-sm text-neutral-600 hover:underline">
          ← Back
        </Link>

        <div className="mt-6 kx-card p-6">
          <Logo />
          <div className="mt-6">
            <div className="kx-h2">Sign in</div>
            <div className="text-sm text-neutral-500">Welcome back.</div>
          </div>

          <form className="mt-6 space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input className="mt-2 kx-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                className="mt-2 kx-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {err ? <div className="text-sm text-red-600">{err}</div> : null}

            <button disabled={busy} className="w-full kx-btn kx-btn-primary">
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 text-sm text-neutral-600">
            No account?{" "}
            <Link href="/signup" className="font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
