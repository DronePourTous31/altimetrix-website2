import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password, redirect: redirectTo } = await request.json();

  const response = NextResponse.json({ redirect: redirectTo || "/dashboard" });
  const supabase = await createClient(response);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response;
}
