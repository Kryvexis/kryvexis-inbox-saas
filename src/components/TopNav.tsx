"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function TopNav({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const supabase = supabaseBrowser();

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const inApp = pathname.startsWith("/app");

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="kx-container py-4 flex items-center justify-between">
        <Link href={inApp ? "/app/inbox" : "/"} className="hover:opacity-90">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          {email ? <span className="kx-badge">{email}</span> : null}
          {inApp ? (
            <button className="kx-btn kx-btn-ghost" onClick={signOut}>
              Logout
            </button>
          ) : (
            <Link className="kx-btn kx-btn-ghost" href="/login">
              Sign in
            </Link>
          )}
          <Link className="kx-btn kx-btn-primary" href="/app/inbox">
            Open App
          </Link>
        </div>
      </div>
    </header>
  );
}
