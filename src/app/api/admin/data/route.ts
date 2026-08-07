import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getQuotaInfo } from "@/lib/quota";

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

  const [profilesCount, projetsCount, livresCount, enCoursCount, attenteCount, erreurCount] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("projets").select("id", { count: "exact", head: true }),
    admin.from("projets").select("id", { count: "exact", head: true }).eq("statut", "livre"),
    admin.from("projets").select("id", { count: "exact", head: true }).eq("statut", "en_traitement"),
    admin.from("projets").select("id", { count: "exact", head: true }).eq("statut", "upload_en_attente"),
    admin.from("projets").select("id", { count: "exact", head: true }).eq("statut", "erreur"),
  ]);

  const { data: abonnementsData } = await admin
    .from("profiles").select("id").eq("abonnement_actif", true);

  const { data: allProjets } = await admin
    .from("projets").select("statut, created_at").limit(500);

  const { data: activeSubscriptions } = await admin
    .from("profiles")
    .select("forfait_id")
    .eq("abonnement_actif", true);

  const { data: allForfaits } = await admin
    .from("forfaits")
    .select("id, prix_mensuel");

  const forfaitPriceMap: Record<string, number> = {};
  (allForfaits || []).forEach((f) => {
    forfaitPriceMap[f.id] = (f.prix_mensuel || 0) / 100;
  });

  // Multi-abonnements : table `abonnements` (si présente) → un client peut
  // cumuler plusieurs forfaits actifs. Sinon on retombe sur le forfait unique.
  const { data: abonnementsActifs, error: abonnementsErr } = await admin
    .from("abonnements")
    .select("user_id, forfait_id")
    .eq("statut", "actif")
    .limit(1000);
  const abonnementsTable = !abonnementsErr;
  const forfaitIdsByUser: Record<string, string[]> = {};
  if (abonnementsTable) {
    (abonnementsActifs || []).forEach((a) => {
      const uid = String(a.user_id);
      if (!forfaitIdsByUser[uid]) forfaitIdsByUser[uid] = [];
      forfaitIdsByUser[uid].push(String(a.forfait_id));
    });
  }

  let total_revenu_mensuel: number;
  if (abonnementsTable) {
    total_revenu_mensuel = (abonnementsActifs || []).reduce(
      (sum, a) => sum + (forfaitPriceMap[String(a.forfait_id)] || 0), 0
    );
  } else {
    total_revenu_mensuel = (activeSubscriptions || []).reduce(
      (sum, s) => sum + (forfaitPriceMap[s.forfait_id] || 0), 0
    );
  }

  // Encaissements réels : paiements enregistrés dans commandes (options de
  // projet + forfaits ponctuels). montant est en centimes.
  const { data: commandesPayee } = await admin
    .from("commandes")
    .select("user_id, montant, created_at, projet_id")
    .eq("statut", "payee")
    .limit(2000);

  // Répartition par client : une commande avec projet_id = achat hors
  // abonnement (options Calepinage 3D / Photos inspection / projet
  // supplémentaire), sans projet_id = paiement d'abonnement.
  const abonnementsByUser: Record<string, number> = {};
  const achatsHorsAbonnementByUser: Record<string, number> = {};
  (commandesPayee || []).forEach((cmd) => {
    const amount = (cmd.montant || 0) / 100;
    const uid = String(cmd.user_id);
    if (cmd.projet_id) {
      achatsHorsAbonnementByUser[uid] = (achatsHorsAbonnementByUser[uid] || 0) + amount;
    } else {
      abonnementsByUser[uid] = (abonnementsByUser[uid] || 0) + amount;
    }
  });

  const nowRef = new Date();
  const total_encaisse = (commandesPayee || []).reduce(
    (sum, c) => sum + ((c.montant || 0) / 100), 0
  );
  const encaisse_mois = (commandesPayee || []).reduce((sum, c) => {
    const d = new Date(c.created_at);
    if (d.getFullYear() === nowRef.getFullYear() && d.getMonth() === nowRef.getMonth()) {
      return sum + ((c.montant || 0) / 100);
    }
    return sum;
  }, 0);

  const stats = {
    total_users: profilesCount.count || 0,
    total_projets: projetsCount.count || 0,
    total_livres: livresCount.count || 0,
    total_en_cours: enCoursCount.count || 0,
    total_attente: attenteCount.count || 0,
    total_erreur: erreurCount.count || 0,
    abonnements_actifs: abonnementsData?.length || 0,
    total_revenu_mensuel,
    total_encaisse,
    encaisse_mois,
  };

  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const monthNamesFull: Record<string, string> = {
    Jan: "Jan", Fév: "Fév", Mar: "Mar", Avr: "Avr", Mai: "Mai",
    Jun: "Juin", Jul: "Juil", Aoû: "Aoû", Sep: "Sep", Oct: "Oct", Nov: "Nov", Déc: "Déc",
  };
  const startMonth = 4;
  const startYear = new Date().getFullYear();
  const monthlyMap: Record<string, { projets: number; livres: number; revenu: number; encaissements: number }> = {};

  const now = new Date();
  const totalMonths = (now.getFullYear() - startYear) * 12 + (now.getMonth() - startMonth) + 1;
  const monthKeys: string[] = [];
  for (let i = 0; i < Math.max(totalMonths, 1); i++) {
    const d = new Date(startYear, startMonth + i, 1);
    const shortKey = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const label = `${monthNamesFull[shortKey] || shortKey} ${year}`;
    monthKeys.push(label);
    if (!monthlyMap[label]) monthlyMap[label] = { projets: 0, livres: 0, revenu: 0, encaissements: 0 };
  }

  (allProjets || []).forEach((p) => {
    const d = new Date(p.created_at);
    const shortKey = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const label = `${monthNamesFull[shortKey] || shortKey} ${year}`;
    if (!monthlyMap[label]) monthlyMap[label] = { projets: 0, livres: 0, revenu: 0, encaissements: 0 };
    monthlyMap[label].projets++;
    if (p.statut === "livre") {
      monthlyMap[label].livres++;
    }
  });

  const activeProfilesAll = await admin
    .from("profiles")
    .select("forfait_id, created_at, abonnement_actif");

  monthKeys.forEach((label) => {
    const parts = label.split(" ");
    const monthLabel = parts[0];
    const yearNum = parseInt(parts[1]);
    const shortKeyReverse = Object.entries(monthNamesFull).find(([k, v]) => v === monthLabel)?.[0];
    const monthIdx = monthNames.indexOf(shortKeyReverse || monthLabel);
    const endOfMonth = new Date(yearNum, monthIdx + 1, 0);
    let revenu = 0;
    (activeProfilesAll.data || []).forEach((p) => {
      if (!p.abonnement_actif || !p.forfait_id) return;
      const created = new Date(p.created_at);
      if (created <= endOfMonth) {
        revenu += forfaitPriceMap[p.forfait_id] || 0;
      }
    });
    monthlyMap[label].revenu = revenu;

    (commandesPayee || []).forEach((c) => {
      const d = new Date(c.created_at);
      if (d.getFullYear() === yearNum && d.getMonth() === monthIdx) {
        monthlyMap[label].encaissements += (c.montant || 0) / 100;
      }
    });
  });

  const monthlyData = monthKeys.map((label) => ({ month: label, ...monthlyMap[label] }));

  const statusMap: Record<string, number> = {};
  (allProjets || []).forEach((p) => {
    statusMap[p.statut] = (statusMap[p.statut] || 0) + 1;
  });
  const projectsByStatus = Object.entries(statusMap).map(([statut, count]) => ({ statut, count }));

  const { data: projetsRaw } = await admin
    .from("projets")
    .select("id, nom, type_analyse, statut, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(100);

  const projetsUserIds = [...new Set((projetsRaw || []).map((p) => String(p.user_id)))] as string[];
  const profilesMap: Record<string, any> = {};
  for (const uid of projetsUserIds) {
    const { data } = await admin.from("profiles").select("prenom, nom").eq("id", uid).limit(1).single();
    if (data) profilesMap[uid] = data;
  }
  const projets = (projetsRaw || []).map((p) => ({
    ...p,
    client: profilesMap[p.user_id] || null,
  }));

  const { data: clientsData } = await admin
    .from("profiles")
    .select("id, prenom, nom, forfait_id, abonnement_actif, essais_gratuits_restants, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: forfaits } = await admin.from("forfaits").select("id, nom, nb_projets_mois, prix_mensuel");

  const { data: authUsers } = await admin.auth.admin.listUsers();
  const emailMap: Record<string, string> = {};
  (authUsers?.users || []).forEach((u) => {
    emailMap[u.id] = u.email || "";
  });

  const clients = await Promise.all(
    (clientsData || []).map(async (c) => {
      const activeForfaitIds = abonnementsTable
        ? (forfaitIdsByUser[c.id] || [])
        : (c.abonnement_actif && c.forfait_id ? [String(c.forfait_id)] : []);
      const forfaitsActifs = (forfaits || []).filter((f) => activeForfaitIds.includes(String(f.id)));
      const forfaitPrincipal = forfaitsActifs[0] || null;
      const forfaitQuota = forfaitsActifs.reduce((s, f) => s + (f.nb_projets_mois || 0), 0);
      const totalAbonnement = forfaitsActifs.reduce((s, f) => s + ((f.prix_mensuel || 0) / 100), 0);
      const quotaInfo = await getQuotaInfo(admin, c.id);
      const { count: nb_projets } = await admin
        .from("projets").select("id", { count: "exact", head: true }).eq("user_id", c.id);
      const { count: nb_projets_livres } = await admin
        .from("projets").select("id", { count: "exact", head: true }).eq("user_id", c.id).eq("statut", "livre");
      const { data: lastProjet } = await admin
        .from("projets").select("created_at").eq("user_id", c.id)
        .order("created_at", { ascending: false }).limit(1).single();

      return {
        ...c,
        email: emailMap[c.id] || "",
        forfait_nom: forfaitPrincipal?.nom || null,
        forfaits_noms: forfaitsActifs.map((f) => f.nom),
        forfait_nb_projets: forfaitQuota,
        total_abonnement: totalAbonnement,
        total_abonnements: abonnementsByUser[c.id] || 0,
        achats_hors_abonnement: achatsHorsAbonnementByUser[c.id] || 0,
        total_achats: (abonnementsByUser[c.id] || 0) + (achatsHorsAbonnementByUser[c.id] || 0),
        projets_restants_forfait: c.abonnement_actif && forfaitQuota > 0 ? quotaInfo.remaining : null,
        nb_projets: nb_projets || 0,
        nb_projets_livres: nb_projets_livres || 0,
        derniere_activite: lastProjet?.created_at || null,
      };
    })
  );

  return NextResponse.json({ stats, monthlyData, projectsByStatus, clients, projets });
}
