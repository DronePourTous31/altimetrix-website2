import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Email API placeholder - will integrate with Resend later
  return NextResponse.json({ sent: true });
}
