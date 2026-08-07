import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const authResp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
  });
  if (!authResp.ok) return NextResponse.json({ error: "Non authé" }, { status: 401 });

  const user = await authResp.json();

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const profResp = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=stripe_customer_id`,
    { headers: { Authorization: `Bearer ${key}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! } }
  );
  if (!profResp.ok) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const profiles = await profResp.json();
  const customerId = profiles[0]?.stripe_customer_id;
  if (!customerId) return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 400 });

  const origin = new URL(req.url).origin;

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/dashboard/mon-compte`,
  });

  return NextResponse.json({ url: portal.url });
}
