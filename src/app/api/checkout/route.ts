import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projetId = searchParams.get("projet_id");
  const montant = searchParams.get("montant");

  // Stripe checkout placeholder - redirects to pricing page
  // TODO: Intégrer Stripe Checkout ici
  return NextResponse.redirect(new URL("/pricing", req.url));
}
