import { NextResponse } from "next/server";
import { getServerSupabaseAdmin } from "@/lib/serverSupabaseAdmin";

export async function GET() {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ configured: false, messages: [] }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("meta_incoming_messages")
    .select("id, phone, contact_name, body, received_at, wamid, metadata")
    .eq("consumed", false)
    .order("received_at", { ascending: true })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message, messages: [] }, { status: 500 });
  }

  return NextResponse.json({ configured: true, messages: data ?? [] });
}
