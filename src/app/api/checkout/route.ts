import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { pricingPlans } from "@/data/pricing";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquante");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
  });
}

async function getSupabase(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        cookies: { getAll: () => [], setAll: () => {} },
      }
    );
  }
  return createClient();
}

// Checkout abonnement / one-shot depuis la page Tarifs
export async function POST(req: Request) {
  const supabase = await getSupabase(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });

  let body: { planId?: string; annual?: boolean; calepinage?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body invalide" }, { status: 400 });
  }

  const plan = pricingPlans.find((p) => p.id === body.planId);
  if (!plan || !plan.stripePriceId) {
    return NextResponse.json({ error: "Forfait inconnu" }, { status: 400 });
  }

  const priceId = body.annual && plan.stripeAnnualPriceId ? plan.stripeAnnualPriceId : plan.stripePriceId;
  const mode = plan.period === "once" ? "payment" : "subscription";

  // Résoudre le forfait_id (table forfaits) pour les plans par abonnement
  const FORFAIT_SLUGS: Record<string, string> = {
    "starter-mesures": "mesure",
    "starter-pro": "pro",
    "solar-pro": "solaire",
    "solar-pro-plus": "solaire-plus",
  };
  let forfaitId: string | null = null;
  if (FORFAIT_SLUGS[plan.id]) {
    const { data: forfait } = await supabase
      .from("forfaits")
      .select("id")
      .eq("slug", FORFAIT_SLUGS[plan.id])
      .maybeSingle();
    forfaitId = forfait?.id ?? null;
  }

  // Récupérer l'email depuis auth.users
  let email = user.email;
  if (!email) {
    const authResp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${req.headers.get("Authorization")?.slice(7) || ""}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    });
    if (authResp.ok) {
      const u = await authResp.json();
      email = u.email;
    }
  }

  const stripe = getStripe();
  const origin = req.headers.get("origin") || new URL(req.url).origin;

  // Récupérer ou créer le customer Stripe
  let customerId: string | null = null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_customer_id) {
    customerId = profile.stripe_customer_id;
  } else if (email) {
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email, name: user.user_metadata?.prenom || user.email });
      customerId = customer.id;
    }
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{ price: priceId, quantity: 1 }];
  if (body.calepinage && mode === "subscription") {
    const calepinagePrice = body.annual
      ? process.env.STRIPE_CALEPINAGE_ANNUAL_PRICE_ID
      : process.env.STRIPE_CALEPINAGE_PRICE_ID;
    if (!calepinagePrice) {
      return NextResponse.json({ error: "Configuration calepinage manquante" }, { status: 500 });
    }
    lineItems.push({ price: calepinagePrice, quantity: 1 });
  }

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: lineItems,
    ...(customerId ? { customer: customerId } : { customer_email: email }),
    success_url: `${origin}/dashboard?stripe=success&plan=${plan.id}`,
    cancel_url: `${origin}/pricing?cancel=1`,
    metadata: {
      user_id: user.id,
      plan_id: plan.id,
      forfait_id: forfaitId || "",
      billing: body.annual ? "annual" : "monthly",
      calepinage: body.calepinage ? "1" : "0",
    },
  });

  return NextResponse.json({ url: session.url });
}
