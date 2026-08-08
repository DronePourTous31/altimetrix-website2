import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { pricingPlans } from "@/data/pricing";
import type { TypeAnalyse } from "@/lib/types";

const ADMIN_IDS = ["cacfc3e4-e408-47f6-bc37-04d813625606"];

const TYPE_PAR_PLAN: Record<string, TypeAnalyse> = {
  "particulier-standard": "mesure",
  "particulier-premium": "solaire",
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });
  if (!ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: demande, error: demandeErr } = await admin
    .from("demandes_particuliers")
    .select("*")
    .eq("id", id)
    .single();
  if (demandeErr || !demande) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }
  if (demande.statut !== "payee") {
    return NextResponse.json({ error: "La demande doit être payée avant de créer le projet" }, { status: 400 });
  }
  if (demande.projet_id) {
    return NextResponse.json({ error: "Un projet existe déjà pour cette demande" }, { status: 409 });
  }

  const plan = pricingPlans.find((p) => p.id === demande.plan_id && p.period === "once");
  if (!plan) {
    return NextResponse.json({ error: "Forfait inconnu" }, { status: 400 });
  }

  let typeAnalyse: TypeAnalyse = TYPE_PAR_PLAN[plan.id] || "mesure";
  let body: { typeAnalyse?: string } = {};
  try { body = await req.json(); } catch {}
  if (body.typeAnalyse && ["mesure", "calepinage", "solaire"].includes(body.typeAnalyse)) {
    typeAnalyse = body.typeAnalyse as TypeAnalyse;
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("prenom, nom")
    .eq("id", demande.user_id)
    .single();

  const adresseComplete = `${demande.adresse}, ${demande.code_postal} ${demande.ville}`.trim();

  const { data: projet, error: projetErr } = await admin.from("projets").insert({
    user_id: demande.user_id,
    nom: `${plan.name} — ${demande.ville}`,
    adresse: adresseComplete,
    type_analyse: typeAnalyse,
    statut: "upload_en_attente",
    options_payees: true,
  }).select().single();

  if (projetErr || !projet) {
    console.error("[admin demande projet] insert error:", projetErr?.message);
    return NextResponse.json({ error: "Erreur création projet" }, { status: 500 });
  }

  await admin.from("demandes_particuliers").update({ projet_id: projet.id }).eq("id", id);

  const clientName = profile ? `${profile.prenom}_${profile.nom}` : demande.user_id;

  return NextResponse.json({
    ok: true,
    projet,
    clientName,
    projectName: projet.nom,
  });
}
