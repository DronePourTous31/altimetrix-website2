import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY manquante");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-04-22.dahlia",
  });
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

  const supabase = await createClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const projetId = session.metadata?.projet_id;
    const userId = session.metadata?.user_id;

    if (projetId && userId) {
      await supabase
        .from("projets")
        .update({ statut: "en_traitement", updated_at: new Date().toISOString() })
        .eq("id", projetId);

      await supabase.from("commandes").insert({
        user_id: userId,
        projet_id: projetId,
        stripe_session_id: session.id,
        montant: session.amount_total || 0,
        statut: "payee",
      });
    }
  }

  return NextResponse.json({ received: true });
}
