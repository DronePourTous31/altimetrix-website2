import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

// Résiliation d'un abonnement : le renouvellement est arrêté à la fin de la
// période en cours (cancel_at_period_end). L'abonnement reste actif jusqu'à
// la prochaine échéance ; il sera marqué « resilie » par le webhook Stripe
// (customer.subscription.deleted).
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const { data: abo, error: aboErr } = await supabase
    .from("abonnements")
    .select("id, user_id, stripe_subscription_id, plan_id, calepinage, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("statut", "actif")
    .single();

  if (aboErr || !abo) {
    return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });
  }

  if (!abo.stripe_subscription_id) {
    return NextResponse.json({ error: "Abonnement sans abonnement Stripe" }, { status: 400 });
  }

  let sub;
  try {
    sub = await stripe.subscriptions.update(abo.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  } catch {
    return NextResponse.json({ error: "Impossible de résilier auprès de Stripe" }, { status: 500 });
  }

  const item = sub.items?.data?.[0];

  return NextResponse.json({
    success: true,
    cancel_at_period_end: true,
    current_period_end: item?.current_period_end
      ? new Date(item.current_period_end * 1000).toISOString()
      : null,
  });
}
