import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { pricingPlans } from "@/data/pricing";
import { sendEmail, demandeValideeHtml, demandeRefuseeHtml } from "@/emails/templates";

const ADMIN_IDS = ["cacfc3e4-e408-47f6-bc37-04d813625606"];

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY manquante");
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
}

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

  let body: { action?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }
  if (body.action !== "valider" && body.action !== "refuser") {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
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

  const plan = pricingPlans.find((p) => p.id === demande.plan_id && p.period === "once");
  if (!plan || !plan.stripePriceId) {
    return NextResponse.json({ error: "Forfait inconnu" }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("prenom, stripe_customer_id")
    .eq("id", demande.user_id)
    .single();

  const { data: { user: authUser } } = await admin.auth.admin.getUserById(demande.user_id);
  const email = authUser?.email || "";
  if (!email) {
    return NextResponse.json({ error: "Email client introuvable" }, { status: 500 });
  }

  const prenom = profile?.prenom || email.split("@")[0] || "";

  if (body.action === "refuser") {
    await admin.from("demandes_particuliers").update({ statut: "refusee" }).eq("id", id);
    sendEmail({
      to: email,
      subject: `Demande de rapport ${plan.name} — non retenue`,
      html: demandeRefuseeHtml({ prenom, planNom: plan.name, note: body.note }),
    }).catch((err) => console.error("Email refus error:", err));
    return NextResponse.json({ ok: true });
  }

  // --- Valider : créer la session de paiement (rapport + captation) ---
  if (!process.env.STRIPE_CAPTATION_PRICE_ID) {
    return NextResponse.json({ error: "STRIPE_CAPTATION_PRICE_ID manquante" }, { status: 500 });
  }

  const stripe = getStripe();
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  // Récupérer ou créer le customer Stripe
  let customerId: string | null = null;
  if (profile?.stripe_customer_id) {
    customerId = profile.stripe_customer_id;
  } else {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email, name: prenom || email });
      customerId = customer.id;
    }
    await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", demande.user_id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      { price: plan.stripePriceId, quantity: 1 },
      { price: process.env.STRIPE_CAPTATION_PRICE_ID, quantity: 1 },
    ],
    customer: customerId || undefined,
    success_url: `${origin}/dashboard?stripe=success&plan=${plan.id}&particulier=1`,
    cancel_url: `${origin}/pricing?cancel=1`,
    metadata: {
      user_id: demande.user_id,
      plan_id: plan.id,
      demande_id: id,
      type: "particulier",
    },
  });

  await admin.from("demandes_particuliers").update({
    statut: "validee",
    stripe_session_id: session.id,
  }).eq("id", id);

  sendEmail({
    to: email,
    subject: `Rapport ${plan.name} — captation validée, paiement à effectuer`,
    html: demandeValideeHtml({ prenom, planNom: plan.name, paiementUrl: session.url || "" }),
  }).catch((err) => console.error("Email validation error:", err));

  return NextResponse.json({ ok: true, paymentUrl: session.url });
}
