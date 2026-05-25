import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const projetId = searchParams.get("projet_id");
  const montant = parseInt(searchParams.get("montant") || "25000", 10);

  if (!projetId || !montant) {
    return NextResponse.redirect(new URL("/dashboard/nouveau-projet?error=1", req.url));
  }

  const origin = req.headers.get("origin") || req.nextUrl.origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Projet photogrammétrie — ${projetId.slice(0, 8)}...`,
            },
            unit_amount: montant,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard/projets/${projetId}?payment=success`,
      cancel_url: `${origin}/dashboard/nouveau-projet?payment=cancel`,
      metadata: {
        projet_id: projetId,
        user_id: user.id,
      },
    });

    return NextResponse.redirect(session.url!);
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.redirect(new URL("/dashboard/nouveau-projet?error=stripe", req.url));
  }
}
