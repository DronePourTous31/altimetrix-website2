import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
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

  const body = await req.json();
  const { projetId, ...updates } = body;

  if (!projetId) {
    return NextResponse.json({ error: "projetId requis" }, { status: 400 });
  }

  const { error } = await supabase.from("projets").update(updates).eq("id", projetId);

  if (error) {
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
