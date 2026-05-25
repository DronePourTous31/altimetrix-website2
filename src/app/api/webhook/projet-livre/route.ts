import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projet_id } = body;

    if (!projet_id) {
      return NextResponse.json({ error: "projet_id requis" }, { status: 400 });
    }

    // Autorisation via clé API partagée (à sécuriser en prod)
    const authHeader = req.headers.get("authorization");
    const expectedKey = process.env.ALTIMETRIX_WEBHOOK_KEY;
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: projet } = await supabase
      .from("projets")
      .select("*")
      .eq("id", projet_id)
      .single();

    if (!projet) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
    }

    if (projet.statut !== "en_traitement") {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const viewer_url = body.viewer_url || null;
    const rapport_url = body.rapport_url || null;

    const { error: updateError } = await supabase
      .from("projets")
      .update({
        statut: "livre",
        viewer_url,
        rapport_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projet_id);

    if (updateError) {
      return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
