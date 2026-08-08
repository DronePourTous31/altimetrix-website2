import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { sendEmail, subscriptionExpiryHtml } from "@/emails/templates";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquante");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-05-27.dahlia",
  });
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Désactive un abonnement (résiliation / impayé) dans la table `abonnements`.
// Si d'autres abonnements restent actifs pour le client, on garde
// profiles.abonnement_actif=true. Sans la table `abonnements` (schéma non
// migré), on retombe sur l'ancien comportement.
async function deactivateSubscription(
  supabase: SupabaseClient,
  stripeSubscriptionId: string | null | undefined,
  customerId: string,
  logErr: (label: string, res: { error: { message?: string; code?: string } | null }) => void
) {
  let tablePresent = false;
  if (stripeSubscriptionId) {
    const { error: aErr } = await supabase
      .from("abonnements")
      .update({ statut: "resilie" })
      .eq("stripe_subscription_id", stripeSubscriptionId);
    if (!aErr) {
      tablePresent = true;
    } else if (aErr.code !== "42P01") {
      logErr("desactivation abonnement", { error: aErr });
    }
  }

  if (tablePresent) {
    const { data: actifs, error: actifsErr } = await supabase
      .from("abonnements")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .eq("statut", "actif");
    if (actifsErr) {
      if (actifsErr.code !== "42P01") logErr("abonnements actifs", { error: actifsErr });
    } else if ((actifs?.length || 0) === 0) {
      logErr("desactivation profil", await supabase
        .from("profiles")
        .update({ abonnement_actif: false, calepinage_actif: false })
        .eq("stripe_customer_id", customerId));
    }
    return;
  }

  logErr("subscription desactivation", await supabase
    .from("profiles")
    .update({ abonnement_actif: false, calepinage_actif: false })
    .eq("stripe_customer_id", customerId));
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabase = getAdmin();
  const logErr = (label: string, res: { error: { message?: string; code?: string } | null }) => {
    if (res.error) console.error(`[stripe-webhook] ${label}:`, res.error.code, res.error.message);
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const userId = metadata.user_id;

      // Paiement des options d'un projet (photos inspection / calepinage 3D)
      // ou d'un projet supplémentaire à la carte. On ne change pas le statut :
      // le watcher lance le traitement une fois upload_termine=true ET
      // options_payees=true.
      if (metadata.projet_id && userId && (metadata.options || metadata.extra_projet === "1")) {
        logErr("update projet options", await supabase
          .from("projets")
          .update({ options_payees: true })
          .eq("id", metadata.projet_id));

        logErr("insert commande options", await supabase.from("commandes").insert({
          user_id: userId,
          projet_id: metadata.projet_id,
          stripe_session_id: session.id,
          montant: session.amount_total || 0,
          statut: "payee",
        }));
        break;
      }

      // Checkout depuis la page Tarifs
      const planId = metadata.plan_id;
      if (!planId || !userId) break;

      // Rapport particulier one-shot (commande validée par l'admin) :
      // on marque la demande payée et on enregistre la commande, sans
      // activer d'abonnement (abonnement_actif reste false).
      if (metadata.type === "particulier" && metadata.demande_id) {
        logErr("update demande payee", await supabase
          .from("demandes_particuliers")
          .update({ statut: "payee" })
          .eq("id", metadata.demande_id));

        logErr("insert commande particulier", await supabase.from("commandes").insert({
          user_id: userId,
          stripe_session_id: session.id,
          montant: session.amount_total || 0,
          statut: "payee",
        }));
        break;
      }

      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

      // Récupérer l'abonnement Stripe si présent
      let stripeSubscriptionId: string | null = null;
      if (session.subscription) {
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const sub = await getStripe().subscriptions.retrieve(subId);
        stripeSubscriptionId = sub.id;
        if (sub.status === "trialing") {
          // Si un trial actif, ne pas activer l'abonnement maintenant
          break;
        }
      }

      const updates: Record<string, unknown> = {
        abonnement_actif: true,
        stripe_customer_id: customerId || undefined,
      };
      if (metadata.forfait_id) updates.forfait_id = metadata.forfait_id;
      if (metadata.plan_id) updates.plan_id = metadata.plan_id;
      if (metadata.calepinage === "1") updates.calepinage_actif = true;

      logErr("update profil", await supabase.from("profiles").update(updates).eq("id", userId));

      // Multi-abonnements : enregistrer l'abonnement dans la table `abonnements`.
      // Table absente (schéma non migré) → on ignore, on reste sur le forfait
      // principal (profiles.forfait_id). L'option Calepinage 3D mensuelle est
      // stockée sur l'abonnement pour distinguer Starter Mesures / Starter Mesures+.
      if (metadata.forfait_id) {
        const insertAbonnement = async (avecCalepinage: boolean) => {
          const row: Record<string, unknown> = {
            user_id: userId,
            forfait_id: metadata.forfait_id,
            plan_id: planId || null,
            stripe_subscription_id: stripeSubscriptionId,
            stripe_customer_id: customerId || null,
            statut: "actif",
          };
          if (avecCalepinage) row.calepinage = metadata.calepinage === "1";
          return supabase.from("abonnements").insert(row);
        };
        const { error: aboErr } = await insertAbonnement(true);
        if (aboErr && aboErr.code === "42703") {
          // Colonne calepinage absente (migration pas encore appliquée) → sans l'option
          const { error: aboErr2 } = await insertAbonnement(false);
          if (aboErr2 && aboErr2.code !== "42P01") logErr("insert abonnement", { error: aboErr2 });
        } else if (aboErr && aboErr.code !== "42P01") logErr("insert abonnement", { error: aboErr });
      }

      logErr("insert commande", await supabase.from("commandes").insert({
        user_id: userId,
        forfait_id: metadata.forfait_id || null,
        stripe_session_id: session.id,
        montant: session.amount_total || 0,
        statut: "payee",
      }));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
      if (!customerId) break;
      await deactivateSubscription(supabase, subscription.id, customerId, logErr);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      if (!subscription.cancel_at_period_end) break;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
      if (!customerId) break;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, prenom")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (!profile) break;

      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id as string);
      if (!user?.email) break;

      sendEmail({
        to: user.email,
        subject: "Votre abonnement expire dans 7 jours",
        html: subscriptionExpiryHtml((profile.prenom as string) || ""),
      }).catch((err) => console.error("Email expiration abonnement error:", err));
      break;
    }

    case "invoice.paid": {
      // Renouvellement mensuel d'un abonnement : enregistré comme commande
      // « forfait (renouvellement) ». La 1re facture (billing_reason
      // subscription_create) est ignorée : le paiement initial est déjà
      // enregistré par checkout.session.completed.
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason !== "subscription_cycle") break;

      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (!customerId) break;
      const inv = invoice as unknown as { subscription?: string | { id?: string } | null };
      const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
      if (!subId) break;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();
      if (!profile) break;

      const sub = await getStripe().subscriptions.retrieve(subId);
      const meta = sub.metadata || {};

      const { data: existing } = await supabase
        .from("commandes")
        .select("id")
        .eq("stripe_session_id", invoice.id)
        .maybeSingle();
      if (existing) break;

      logErr("insert commande renouvellement", await supabase.from("commandes").insert({
        user_id: profile.id,
        forfait_id: meta.forfait_id || null,
        stripe_session_id: invoice.id,
        montant: invoice.amount_paid || 0,
        statut: "payee",
      }));
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      if (!customerId) break;
      const inv = invoice as unknown as { subscription?: string | { id?: string } | null };
      const subId = typeof inv.subscription === "string" ? inv.subscription : inv.subscription?.id;
      await deactivateSubscription(supabase, subId, customerId, logErr);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
