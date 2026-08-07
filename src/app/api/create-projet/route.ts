import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { resolvePlanId, typeAllowedForPlan, calepinagePayantForPlans, CALEPINAGE_PAYANT_PLAN_IDS } from "@/lib/plans";
import { getActivePlanIds } from "@/lib/quota";
import type { TypeAnalyse } from "@/lib/types";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  let supabase;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        cookies: { getAll: () => [], setAll: () => {} },
      }
    );
  } else {
    supabase = await createClient();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });

  const { nom, adresse, typeAnalyse, inspectionPhotos, optionCalepinage } = await req.json();
  if (!nom || !typeAnalyse) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const type: TypeAnalyse = typeAnalyse;
  if (!["mesure", "calepinage", "solaire"].includes(type)) {
    return NextResponse.json({ error: "Type d'analyse inconnu" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, nom, abonnement_actif, essais_gratuits_restants, plan_id, forfait_id, calepinage_actif")
    .eq("id", user.id)
    .single();

  let forfait: { slug: string | null; nb_projets_mois: number } | null = null;
  if (profile?.forfait_id) {
    const { data: f } = await supabase
      .from("forfaits")
      .select("slug, nb_projets_mois")
      .eq("id", profile.forfait_id)
      .maybeSingle();
    forfait = f ?? null;
  }

  const planId = resolvePlanId({ plan_id: profile?.plan_id, forfait_slug: forfait?.slug ?? null });
  const aUnEssai = (profile?.essais_gratuits_restants ?? 0) > 0;

  // Pas de forfait valide (abonnement actif) ni d'essai restant → renvoi vers les
  // Tarifs. Un abonnement expiré (plan_id encore renseigné) ne permet plus de créer.
  if ((!planId && !aUnEssai) || (!profile?.abonnement_actif && !aUnEssai)) {
    return NextResponse.json(
      { error: "Aucun forfait actif. Choisissez une offre pour créer un projet.", redirect: "/pricing?besoin=projet" },
      { status: 403 }
    );
  }

  // Types couverts : union de TOUS les forfaits actifs (multi-abonnements).
  // Un type n'est autorisé que si au moins un forfait actif le couvre (ou
  // l'essai) — jamais de projet facturé à la carte par surprise.
  const activePlanIds = await getActivePlanIds(supabase, user.id);
  if (activePlanIds.length === 0 && planId) activePlanIds.push(planId);
  const typeOk = aUnEssai || activePlanIds.some((pid) => pid && typeAllowedForPlan(type, pid));
  if (!typeOk) {
    return NextResponse.json(
      { error: "Ce type de projet n'est pas inclus dans vos forfaits actifs.", redirect: "/pricing?besoin=upgrade" },
      { status: 403 }
    );
  }

  // Quota mensuel : plus de blocage ici. Un projet créé au-delà du quota du
  // forfait est un "projet supplémentaire à la carte", facturé avant
  // traitement via finaliser-projet → checkout-options (19/15/29/22€).
  //

  // Le calepinage ponctuel (+10€/projet) est obligatoire pour un projet Calepinage 3D
  // tant que tous les forfaits actifs sont des Starter Mesures (sauf add-on mensuel
  // actif). Dès qu'un forfait incluant le calepinage est actif (Solar Pro…), c'est inclus.
  const calepinagePayant = calepinagePayantForPlans(activePlanIds, !!profile?.calepinage_actif);
  const optionCalepinageFinal = calepinagePayant && (type === "calepinage" || !!optionCalepinage);

  // « Métrés & mesures » seul est redondant dès que le calepinage est inclus
  // dans un forfait actif (Starter Mesures+, Starter Pro, Solar Pro…) : un
  // projet « mesure » serait une analyse incomplète qui gaspille un créneau.
  // Pendant l'essai gratuit, toutes les analyses restent accessibles.
  const calepinageInclus =
    !!profile?.calepinage_actif ||
    activePlanIds.some(
      (pid) => pid && typeAllowedForPlan("calepinage", pid) && !CALEPINAGE_PAYANT_PLAN_IDS.includes(pid)
    );
  if (!aUnEssai && type === "mesure" && calepinageInclus) {
    return NextResponse.json(
      { error: "« Métrés & mesures » est inclus dans « Calepinage 3D » — lancez plutôt un projet Calepinage 3D." },
      { status: 403 }
    );
  }

  const { data: projet, error } = await supabase
    .from("projets")
    .insert({
      user_id: user.id,
      nom,
      adresse: adresse || null,
      type_analyse: type,
      statut: "upload_en_attente",
      inspection_photos: !!inspectionPhotos,
      option_calepinage: optionCalepinageFinal,
    })
    .select()
    .single();

  if (error || !projet) {
    return NextResponse.json({ error: "Erreur création projet" }, { status: 500 });
  }

  return NextResponse.json({
    projet,
    clientName: profile ? `${profile.prenom}_${profile.nom}` : `${user.email}`,
    profile,
    plan: { planId, forfaitSlug: forfait?.slug ?? null, aUnEssai },
  });
}
