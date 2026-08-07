import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { resolvePlanId } from "@/lib/plans";
import { getQuotaInfo, isExtraProject } from "@/lib/quota";

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

  const { projetId } = await req.json();
  if (!projetId) return NextResponse.json({ error: "projetId requis" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement_actif, essais_gratuits_restants, forfait_id, plan_id")
    .eq("id", user.id)
    .single();

  let forfaitSlug: string | null = null;
  if (profile?.forfait_id) {
    const { data: forfait } = await supabase
      .from("forfaits")
      .select("slug")
      .eq("id", profile.forfait_id)
      .maybeSingle();
    forfaitSlug = forfait?.slug ?? null;
  }
  const planId = resolvePlanId({ plan_id: profile?.plan_id, forfait_slug: forfaitSlug });

  const { data: projet } = await supabase
    .from("projets")
    .select("inspection_photos, option_calepinage")
    .eq("id", projetId)
    .single();

  // Non abonné et sans essai restant → renvoi vers les Tarifs
  if (!profile?.abonnement_actif && (profile?.essais_gratuits_restants ?? 0) <= 0) {
    return NextResponse.json({ redirect: "/pricing?besoin=projet", abonnementActif: false });
  }

  // Options payables : uniquement abonnés (les photos d'inspection sont à +5€)
  const inspectionChargeable = !!projet?.inspection_photos && !!planId;
  const hasChargeableOptions =
    profile?.abonnement_actif &&
    Boolean(inspectionChargeable || projet?.option_calepinage);

  // Projet supplémentaire à la carte : le quota mensuel (somme des forfaits
  // actifs) est déjà épuisé → le projet est facturé avant traitement.
  let extraRequis = false;
  if (profile?.abonnement_actif && planId) {
    const quota = await getQuotaInfo(supabase, user.id);
    extraRequis = isExtraProject(quota);
  }

  if (hasChargeableOptions || extraRequis) {
    // Options et/ou projet supplémentaire à régler avant traitement → checkout-options
    // (le watcher attend options_payees=true, posé par le webhook Stripe).
    return NextResponse.json({
      redirect: `/api/checkout-options?projet_id=${projetId}`,
      options: true,
      extra: extraRequis,
    });
  }

  // Aucune option payante : les options sont considérées réglées
  await supabase.from("projets").update({ options_payees: true }).eq("id", projetId);

  if (profile?.abonnement_actif) {
    return NextResponse.json({ redirect: `/dashboard/projets/${projetId}`, abonnementActif: true });
  }

  if ((profile?.essais_gratuits_restants ?? 0) > 0) {
    await supabase.from("profiles").update({
      essais_gratuits_restants: (profile?.essais_gratuits_restants ?? 0) - 1,
    }).eq("id", user.id);
    return NextResponse.json({ redirect: `/dashboard/projets/${projetId}`, essai: true });
  }

  return NextResponse.json({ redirect: "/pricing?besoin=projet", abonnementActif: false });
}
