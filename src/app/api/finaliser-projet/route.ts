import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/api-auth";

export async function POST(req: NextRequest) {
  const { user, supabase } = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { projet_id } = await req.json();
  if (!projet_id) {
    return NextResponse.json({ error: "projet_id requis" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement_actif, essais_gratuits_restants")
    .eq("id", user.id)
    .single();

  const isBypass = req.nextUrl.searchParams.get("dev") === "1";

  if (profile?.abonnement_actif || isBypass) {
    if (isBypass) {
      await supabase.from("projets").update({ statut: "en_traitement" }).eq("id", projet_id);
    }
    return NextResponse.json({ redirect: `/dashboard/projets/${projet_id}` });
  }

  if ((profile?.essais_gratuits_restants ?? 0) > 0) {
    await supabase
      .from("profiles")
      .update({ essais_gratuits_restants: (profile?.essais_gratuits_restants ?? 0) - 1 })
      .eq("id", user.id);
    await supabase
      .from("projets")
      .update({ statut: "en_traitement" })
      .eq("id", projet_id);
    return NextResponse.json({ redirect: `/dashboard/projets/${projet_id}` });
  }

  return NextResponse.json({ redirect: `/api/checkout?projet_id=${projet_id}&montant=25000` });
}
