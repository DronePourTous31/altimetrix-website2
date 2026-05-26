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

  const { nom, adresse, typeAnalyse } = await req.json();
  if (!nom || !typeAnalyse) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const { data: projet, error } = await supabase
    .from("projets")
    .insert({ user_id: user.id, nom, adresse: adresse || null, type_analyse: typeAnalyse, statut: "upload_en_attente" })
    .select()
    .single();

  if (error || !projet) {
    return NextResponse.json({ error: "Erreur création projet" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, nom, abonnement_actif, essais_gratuits_restants")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    projet,
    clientName: profile ? `${profile.prenom}_${profile.nom}` : `${user.email}`,
    profile,
  });
}
