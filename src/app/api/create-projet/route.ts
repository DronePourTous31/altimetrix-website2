import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/api-auth";

export async function POST(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  const { nom, adresse, type_analyse, notes } = body;

  if (!nom || !type_analyse) {
    return NextResponse.json({ error: "nom et type_analyse requis" }, { status: 400 });
  }

  const { data: projet, error } = await supabase
    .from("projets")
    .insert({
      user_id: user.id,
      nom,
      adresse: adresse || null,
      notes: notes || null,
      type_analyse,
      statut: "upload_en_attente",
    })
    .select()
    .single();

  if (error || !projet) {
    console.error("create-projet error:", error);
    return NextResponse.json({ error: "Erreur création projet" }, { status: 500 });
  }

  return NextResponse.json({ projet_id: projet.id, projet });
}
