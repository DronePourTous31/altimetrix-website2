import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { resolvePlanId, calepinagePayantForPlans } from "@/lib/plans";
import { getQuotaInfo, isExtraProject, getActivePlanIds } from "@/lib/quota";

// Price IDs Stripe des projets supplémentaires à la carte, par plan
const EXTRA_PROJET_PRICE_IDS: Record<string, string | undefined> = {
  "starter-mesures": process.env.STRIPE_EXTRA_PROJET_MESURES_PRICE_ID,
  "starter-pro": process.env.STRIPE_EXTRA_PROJET_PRO_PRICE_ID,
  "solar-pro": process.env.STRIPE_EXTRA_PROJET_SOLAR_PRICE_ID,
  "solar-pro-plus": process.env.STRIPE_EXTRA_PROJET_SOLAR_PLUS_PRICE_ID,
};

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

// Checkout one-shot des options payantes d'un projet (photos inspection / calepinage 3D)
export async function GET(req: Request) {
  const supabase = await getSupabase(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));

  const { searchParams } = new URL(req.url);
  const projetId = searchParams.get("projet_id");
  if (!projetId) {
    return NextResponse.redirect(new URL("/dashboard/nouveau-projet?error=1", req.url));
  }

  const { data: projet } = await supabase
    .from("projets")
    .select("id, inspection_photos, option_calepinage")
    .eq("id", projetId)
    .eq("user_id", user.id)
    .single();

  if (!projet) {
    return NextResponse.redirect(new URL("/dashboard/nouveau-projet?error=1", req.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement_actif, forfait_id, plan_id, calepinage_actif, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const projetUrl = `${origin}/dashboard/projets/${projetId}`;

  if (!profile?.abonnement_actif) {
    return NextResponse.redirect(new URL("/pricing?besoin=projet", origin));
  }

  let forfaitSlug: string | null = null;
  if (profile.forfait_id) {
    const { data: forfait } = await supabase
      .from("forfaits")
      .select("slug")
      .eq("id", profile.forfait_id)
      .maybeSingle();
    forfaitSlug = forfait?.slug ?? null;
  }
  const planId = resolvePlanId({ plan_id: profile.plan_id, forfait_slug: forfaitSlug });

  // Les photos sont incluses dans certains forfaits
  const inspectionPrice = process.env.STRIPE_INSPECTION_PRICE_ID;
  const calepinagePrice = process.env.STRIPE_CALEPINAGE_3D_PRICE_ID;

  // Types couverts par tous les forfaits actifs : le calepinage n'est payant
  // que si TOUS les forfaits actifs sont des Starter Mesures (sans add-on).
  const activePlanIds = await getActivePlanIds(supabase, user.id);
  if (activePlanIds.length === 0 && planId) activePlanIds.push(planId);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const optionsMeta: string[] = [];

  if (projet.inspection_photos && planId && inspectionPrice) {
    lineItems.push({ price: inspectionPrice, quantity: 1 });
    optionsMeta.push("inspection");
  }
  if (projet.option_calepinage && planId && calepinagePayantForPlans(activePlanIds, !!profile.calepinage_actif) && calepinagePrice) {
    lineItems.push({ price: calepinagePrice, quantity: 1 });
    optionsMeta.push("calepinage");
  }

  // Projet supplémentaire à la carte : le quota du mois (somme des forfaits
  // actifs) est épuisé → facturation du projet avant traitement.
  let extraRequis = false;
  const extraPriceId = planId ? EXTRA_PROJET_PRICE_IDS[planId] : undefined;
  if (extraPriceId) {
    const quota = await getQuotaInfo(supabase, user.id);
    extraRequis = isExtraProject(quota);
    if (extraRequis) {
      lineItems.push({ price: extraPriceId, quantity: 1 });
      optionsMeta.push("extra_projet");
    }
  }

  // Rien à payer → options considérées réglées (le watcher traitera après upload_termine)
  if (lineItems.length === 0) {
    await supabase.from("projets").update({ options_payees: true }).eq("id", projetId);
    return NextResponse.redirect(projetUrl);
  }

  const stripe = getStripe();

  // Customer Stripe (réutilisation si déjà créé)
  let customerId: string | null = profile.stripe_customer_id ?? null;
  if (!customerId) {
    const email = user.email;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email, name: user.user_metadata?.prenom || email });
        customerId = customer.id;
      }
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      ...(customerId ? { customer: customerId } : { customer_email: user.email }),
      success_url: `${projetUrl}?payment=success`,
      cancel_url: `${projetUrl}?payment=cancel`,
      metadata: { user_id: user.id, projet_id: projetId, options: optionsMeta.join(","), extra_projet: extraRequis ? "1" : "0" },
    });

    return NextResponse.redirect(session.url!);
  } catch (err) {
    console.error("[checkout-options] Stripe error:", err);
    return NextResponse.redirect(new URL("/dashboard/nouveau-projet?error=stripe", origin));
  }
}
