import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // Stats
  const { count: en_attente } = await supabase.from("projets").select("*", { count: "exact", head: true }).eq("statut", "upload_en_attente");
  const { count: en_traitement } = await supabase.from("projets").select("*", { count: "exact", head: true }).eq("statut", "en_traitement");
  const { count: livre } = await supabase.from("projets").select("*", { count: "exact", head: true }).eq("statut", "livre");
  const { count: erreur } = await supabase.from("projets").select("*", { count: "exact", head: true }).eq("statut", "erreur");
  const { count: clients } = await supabase.from("profiles").select("*", { count: "exact", head: true });

  // MRR approximatif (somme des abonnements actifs)
  const { data: mrrData } = await supabase
    .from("profiles")
    .select("forfait_id")
    .eq("abonnement_actif", true);
  const actifCount = mrrData?.length || 0;
  const mrr = actifCount * 69; // approximation

  // Projets
  const { data: projets } = await supabase
    .from("projets")
    .select("id, nom, adresse, type_analyse, statut, created_at, profiles(prenom, nom)")
    .order("created_at", { ascending: false })
    .limit(100);

  // Clients
  const { data: clientsData } = await supabase
    .from("profiles")
    .select("id, prenom, nom, email, forfait_id, abonnement_actif, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  // Projets count per client
  const clientsWithCount = await Promise.all(
    (clientsData || []).map(async (c) => {
      const { count } = await supabase
        .from("projets")
        .select("*", { count: "exact", head: true })
        .eq("user_id", c.id);
      return { ...c, projets_count: count || 0 };
    })
  );

  // Bar chart data (projets par mois sur 6 derniers mois)
  const barData: { mois: string; projets: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
    const { count } = await supabase
      .from("projets")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start)
      .lt("created_at", end);
    barData.push({
      mois: d.toLocaleDateString("fr-FR", { month: "short" }),
      projets: count || 0,
    });
  }

  // Pie data (type d'analyse)
  const { data: typeCounts } = await supabase.from("projets").select("type_analyse");
  const pieMap: Record<string, number> = {};
  for (const p of typeCounts || []) {
    pieMap[p.type_analyse] = (pieMap[p.type_analyse] || 0) + 1;
  }
  const pieData = Object.entries(pieMap).map(([name, value]) => ({ name, value }));

  return NextResponse.json({
    stats: { en_attente: en_attente || 0, en_traitement: en_traitement || 0, livre: livre || 0, erreur: erreur || 0, clients: clients || 0, mrr },
    projets: projets || [],
    clients: clientsWithCount,
    barData,
    pieData,
  });
}
