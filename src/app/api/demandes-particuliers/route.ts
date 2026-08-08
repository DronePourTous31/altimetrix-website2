import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { pricingPlans } from "@/data/pricing";
import { isInInterventionZone } from "@/data/pricing";
import { sendEmail, demandeRecueHtml } from "@/emails/templates";

const ADMIN_EMAIL = "contact@altimetrix.fr";

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

  let body: { planId?: string; adresse?: string; codePostal?: string; ville?: string };
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
