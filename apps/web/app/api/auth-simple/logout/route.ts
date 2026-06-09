import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth-simple";

export async function POST() {
  await clearSession();
  return NextResponse.json({ success: true });
}
