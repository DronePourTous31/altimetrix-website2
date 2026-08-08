import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { pricingPlans } from "@/data/pricing";

const ADMIN_IDS = ["cacfc3e4-e408-47f6-bc37-04d813625606"];

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });
  if (!ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: demandes, error } = await admin
    .from("demandes_particuliers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ error: "Table demandes_particuliers absente — appliquer la migration SQL" }, { status: 500 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((demandes || []).map((d) => String(d.user_id)))] as string[];
  const profilesMap: Record<string, { prenom?: string; nom?: string }> = {};
  for (const uid of userIds) {
    const { data } = await admin.from("profiles").select("prenom, nom").eq("id", uid).limit(1).single();
    if (data) profilesMap[uid] = data;
  }

  const emailMap: Record<string, string> = {};
  const { data: authUsers } = await admin.auth.admin.listUsers();
  (authUsers?.users || []).forEach((u) => {
    emailMap[u.id] = u.email || "";
  });

  const planNomMap: Record<string, string> = {};
  pricingPlans.forEach((p) => { planNomMap[p.id] = p.name; });

  // Projets liés aux demandes (traitement lancé par l'admin).
  const projetIds = [...new Set((demandes || []).map((d) => d.projet_id).filter(Boolean))] as string[];
  const projetsMap: Record<string, { id: string; nom: string; statut: string; type_analyse: string; adresse: string | null; created_at: string; delivered_at: string | null; rapports_pdf: { nom: string; url: string }[] | null }> = {};
  if (projetIds.length > 0) {
    const { data: projets } = await admin
      .from("projets")
      .select("id, nom, statut, type_analyse, adresse, created_at, delivered_at, rapports_pdf")
      .in("id", projetIds);
    (projets || []).forEach((p) => { projetsMap[p.id] = p; });
  }

  const rows = (demandes || []).map((d) => ({
    ...d,
    client: profilesMap[d.user_id] || null,
    email: emailMap[d.user_id] || "",
    plan_nom: planNomMap[d.plan_id] || d.plan_id,
    projet: d.projet_id ? projetsMap[d.projet_id] || null : null,
  }));

  return NextResponse.json({ demandes: rows });
}
