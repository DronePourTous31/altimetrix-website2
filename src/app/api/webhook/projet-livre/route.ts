import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projetId, viewerUrl, rapportUrl } = body;

    if (!projetId) {
      return NextResponse.json({ error: "projetId requis" }, { status: 400 });
    }

    const supabase = await createClient();
    const update: Record<string, any> = {
      statut: "livre",
      delivered_at: new Date().toISOString(),
    };
    if (viewerUrl) update.viewer_url = viewerUrl;
    if (rapportUrl) update.rapport_url = rapportUrl;

    const { error } = await supabase.from("projets").update(update).eq("id", projetId);

    if (error) {
      console.error("Erreur mise à jour projet:", error);
      return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
  }
}
