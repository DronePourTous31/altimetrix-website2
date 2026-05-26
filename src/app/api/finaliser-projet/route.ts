import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  let supabase;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        cookies: { getAll: () => [], setAll: () => {} },
      }
    );
  } else {
    supabase = await createClient();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });

  const { projetId } = await req.json();
  if (!projetId) return NextResponse.json({ error: "projetId requis" }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement_actif, essais_gratuits_restants")
    .eq("id", user.id)
    .single();

  const isBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

  if (profile?.abonnement_actif || isBypass) {
    if (isBypass) {
      await supabase.from("projets").update({ statut: "en_traitement" }).eq("id", projetId);
    }
    return NextResponse.json({ redirect: `/dashboard/projets/${projetId}`, abonnementActif: true });
  }

  if ((profile?.essais_gratuits_restants ?? 0) > 0) {
    await supabase.from("profiles").update({
      essais_gratuits_restants: (profile?.essais_gratuits_restants ?? 0) - 1,
    }).eq("id", user.id);
    await supabase.from("projets").update({ statut: "en_traitement" }).eq("id", projetId);
    return NextResponse.json({ redirect: `/dashboard/projets/${projetId}`, essai: true });
  }

  return NextResponse.json({ redirect: `/api/checkout?projet_id=${projetId}&montant=25000`, paiement: true });
}
