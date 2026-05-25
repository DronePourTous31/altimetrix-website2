import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  const { data: projets } = await supabase.from("projets").select("*").order("created_at", { ascending: false });
  const { data: forfaits } = await supabase.from("forfaits").select("*");

  return NextResponse.json({ users, projets, forfaits });
}
