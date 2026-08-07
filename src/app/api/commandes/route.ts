import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TYPE_ANALYSE_LABEL: Record<string, string> = {
  mesure: "Métrés & mesures",
  calepinage: "Calepinage 3D",
  solaire: "Analyse solaire",
};

// Libellé des commandes « forfait » héritées (avant que forfait_id soit
// renseigné par le webhook) — détection par montant.
const LEGACY_FORFAIT_LABEL: Record<number, string> = {
  4900: "Forfait Starter Mesures",
  5900: "Forfait Starter Mesures+",
  7900: "Forfait Solar Pro",
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });

  const { data, error } = await supabase
    .from("commandes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json([], { status: 200 });
  const cmds = data || [];
  if (cmds.length === 0) return NextResponse.json([]);

  const projetIds = [...new Set(cmds.filter((c) => c.projet_id).map((c) => String(c.projet_id)))];
  const forfaitIds = [...new Set(cmds.filter((c) => c.forfait_id).map((c) => String(c.forfait_id)))];

  const [{ data: projets }, { data: forfaits }] = await Promise.all([
    projetIds.length
      ? supabase.from("projets").select("id, type_analyse, inspection_photos, option_calepinage").in("id", projetIds)
      : { data: [] },
    forfaitIds.length
      ? supabase.from("forfaits").select("id, nom").in("id", forfaitIds)
      : { data: [] },
  ]);

  const pMap = new Map((projets || []).map((p) => [String((p as { id: string }).id), p]));
  const fMap = new Map((forfaits || []).map((f) => [String((f as { id: string }).id), f]));

  const out = cmds.map((c) => {
    const cid = String(c.id);
    let type: "forfait" | "achat" = "forfait";
    let libelle = "Forfait";

    if (c.projet_id) {
      type = "achat";
      const p = pMap.get(String(c.projet_id)) as {
        type_analyse?: string | null;
        inspection_photos?: boolean;
        option_calepinage?: boolean;
      } | undefined;
      const optionTotal = (p?.inspection_photos ? 500 : 0) + (p?.option_calepinage ? 1000 : 0);
      const isExtra = (c.montant || 0) > optionTotal;
      const parts: string[] = [];
      if (p?.inspection_photos) parts.push("Photos inspection");
      if (p?.option_calepinage) parts.push("Calepinage 3D");

      if (isExtra) {
        libelle = "Projet à la carte";
        if (parts.length) libelle += ` — ${parts.join(" + ")}`;
        if (p?.type_analyse) libelle += ` (${TYPE_ANALYSE_LABEL[p.type_analyse] ?? p.type_analyse})`;
      } else if (parts.length) {
        libelle = `Options projet — ${parts.join(" + ")}`;
      } else {
        libelle = "Paiement projet";
      }
    } else if (c.forfait_id) {
      const f = fMap.get(String(c.forfait_id)) as { nom?: string } | undefined;
      // Starter Mesures+ = Starter Mesures (49€) + option Calepinage 3D (10€) :
      // détection par montant (59€), comme pour les commandes héritées.
      const montant = c.montant || 0;
      const isStarterMesuresPlus = (f?.nom ?? "").trim() === "Starter Mesures" && montant === 5900;
      libelle = isStarterMesuresPlus ? "Forfait Starter Mesures+" : `Forfait ${f?.nom ?? "abonnement"}`;
      // Les renouvellements mensuels (stripe_session_id = id de facture "in_...")
      const session = String(c.stripe_session_id || "");
      if (session.startsWith("in_")) libelle += " (renouvellement)";
    } else {
      libelle = LEGACY_FORFAIT_LABEL[c.montant as number] ?? "Forfait abonnement";
    }

    return { ...c, id: cid, type, libelle };
  });

  return NextResponse.json(out);
}
