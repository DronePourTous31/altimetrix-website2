import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { pricingPlans } from "@/data/pricing";
import { isInInterventionZone } from "@/data/pricing";
import { sendEmail, demandeRecueHtml } from "@/emails/templates";

const ADMIN_EMAIL = "contact@altimetrix.fr";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquante");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
}

// Liste des demandes de l'utilisateur connecté. Pour une demande « validee »,
// on récupère l'URL de la session Stripe afin que le client puisse payer
// depuis « Mon compte » (l'email est un canal de confort, pas le seul).
export async function GET(req: Request) {
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

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: demandes, error } = await admin
    .from("demandes_particuliers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const planNomMap: Record<string, string> = {};
  pricingPlans.forEach((p) => { planNomMap[p.id] = p.name; });

  // Projets liés aux demandes (traitement lancé par l'admin).
  const projetIds = [...new Set((demandes || []).map((d) => d.projet_id).filter(Boolean))] as string[];
  const projetsMap: Record<string, { id: string; nom: string; statut: string; type_analyse: string; adresse: string | null; created_at: string; delivered_at: string | null }> = {};
  if (projetIds.length > 0) {
    const { data: projets } = await admin
      .from("projets")
      .select("id, nom, statut, type_analyse, adresse, created_at, delivered_at")
      .in("id", projetIds);
    (projets || []).forEach((p) => { projetsMap[p.id] = p; });
  }

  const stripe = getStripe();
  const rows = [];
  for (const d of demandes || []) {
    let paiementUrl: string | null = null;
    if (d.statut === "validee" && d.stripe_session_id) {
      try {
        const s = await stripe.checkout.sessions.retrieve(d.stripe_session_id);
        if (s.status === "open" || s.status === "expired") {
          paiementUrl = s.url || null;
        }
      } catch {
        // Session introuvable (cleanup Stripe) → pas de lien.
      }
    }
    rows.push({
      id: d.id,
      plan_id: d.plan_id,
      plan_nom: planNomMap[d.plan_id] || d.plan_id,
      adresse: d.adresse,
      code_postal: d.code_postal,
      ville: d.ville,
      hors_zone: d.hors_zone,
      description: d.description || null,
      statut: d.statut,
      stripe_session_id: d.stripe_session_id,
      paiement_url: paiementUrl,
      created_at: d.created_at,
      updated_at: d.updated_at,
      projet: d.projet_id ? projetsMap[d.projet_id] || null : null,
    });
  }

  return NextResponse.json({ demandes: rows });
}

export async function POST(req: Request) {
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

  let body: { planId?: string; adresse?: string; codePostal?: string; ville?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }

  const plan = pricingPlans.find((p) => p.id === body.planId && p.period === "once");
  if (!plan || !plan.stripePriceId) {
    return NextResponse.json({ error: "Forfait inconnu" }, { status: 400 });
  }
  if (!body.adresse?.trim() || !body.codePostal?.trim() || !body.ville?.trim()) {
    return NextResponse.json({ error: "Adresse incomplète" }, { status: 400 });
  }

  const horsZone = !isInInterventionZone(body.codePostal);

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: demande, error } = await admin.from("demandes_particuliers").insert({
    user_id: user.id,
    plan_id: plan.id,
    adresse: body.adresse.trim(),
    code_postal: body.codePostal.trim(),
    ville: body.ville.trim(),
    hors_zone: horsZone,
    description: body.description?.trim() || null,
    statut: "en_attente",
  }).select("id").single();

  if (error || !demande) {
    console.error("[demandes-particuliers] insert error:", error?.message);
    return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  }

  const prenom = user.user_metadata?.prenom || user.email?.split("@")[0] || "";
  sendEmail({
    to: ADMIN_EMAIL,
    subject: `Nouvelle demande de rapport ${plan.name} (particulier)`,
    html: demandeRecueHtml({
      prenom,
      email: user.email || "",
      planNom: plan.name,
      adresse: body.adresse.trim(),
      codePostal: body.codePostal.trim(),
      ville: body.ville.trim(),
      horsZone,
      demandeId: demande.id,
    }),
  }).catch((err) => console.error("Email demande reçue error:", err));

  return NextResponse.json({ ok: true, demandeId: demande.id });
}
