import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, projectReadyHtml } from "@/emails/templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projetId, viewerUrl, rapportUrl } = body;

    if (!projetId) {
      return NextResponse.json({ error: "projetId requis" }, { status: 400 });
    }

    const supabase = await createClient();
    const update: Record<string, string> = {
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

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: projet } = await admin
      .from("projets")
      .select("user_id, nom")
      .eq("id", projetId)
      .single();

    if (projet?.user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("prenom, nom")
        .eq("id", projet.user_id)
        .maybeSingle();
      const { data: { user } } = await admin.auth.admin.getUserById(projet.user_id);

      if (user?.email) {
        const prenom = (profile?.prenom as string | undefined) || "";
        const projetNom = (projet.nom as string | undefined) || "Projet";
        const projetUrl = viewerUrl || `https://altimetrix.fr/dashboard/projets/${projetId}`;
        sendEmail({
          to: user.email,
          subject: "Votre modèle 3D est prêt !",
          html: projectReadyHtml(prenom, projetNom, projetUrl),
        }).catch((err) => console.error("Email modèle prêt error:", err));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
  }
}
