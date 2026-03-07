import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/serverSupabaseAdmin";

export async function POST(request: NextRequest) {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase admin not configured" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const ids = Array.isArray(body?.ids) ? body.ids.filter((value: unknown) => typeof value === "string") : [];

  if (!ids.length) {
    return NextResponse.json({ ok: true, count: 0 });
  }

  const { error } = await supabase
    .from("meta_incoming_messages")
    .update({ consumed: true, consumed_at: new Date().toISOString() })
    .in("id", ids);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: ids.length });
}
