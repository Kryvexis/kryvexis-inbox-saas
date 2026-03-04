"use client";

import Link from "next/link";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/app/inbox`,
      },
    });

    setBusy(false);
    if (error) return setErr(error.message);

    // With email confirmations disabled, user is active immediately.
    // The DB trigger should create profile (we include SQL for it).
    window.location.href = "/onboarding";
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
            <div className="kx-h2">Create account</div>
            <div className="text-sm text-neutral-500">Start your workspace.</div>
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
              <div className="mt-1 text-xs text-neutral-500">Minimum 6 characters.</div>
            </div>

            {err ? <div className="text-sm text-red-600">{err}</div> : null}

            <button disabled={busy} className="w-full kx-btn kx-btn-primary">
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>

          <div className="mt-4 text-sm text-neutral-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
