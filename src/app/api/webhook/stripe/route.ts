import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Stripe webhook placeholder
  // TODO: Intégrer Stripe webhook pour mettre à jour les commandes
  return NextResponse.json({ received: true });
}
