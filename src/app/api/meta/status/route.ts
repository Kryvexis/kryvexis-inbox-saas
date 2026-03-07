import { NextResponse } from "next/server";
import { getMetaConnectionState } from "@/lib/meta";

export async function GET() {
  return NextResponse.json(getMetaConnectionState());
}
