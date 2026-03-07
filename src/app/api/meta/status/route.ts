import { NextResponse } from "next/server";
import { getMetaConnectionState } from "@/lib/meta";

export async function GET() {
  return NextResponse.json({ ...getMetaConnectionState(), incomingSync: true, incomingStore: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) });
}
