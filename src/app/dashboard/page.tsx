import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, AlertTriangle, Gift, FolderOpen, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";

function getBadgeStatus(statut: string): "actif" | "en_cours" | "livre" | "erreur" {
  const map: Record<string, "actif" | "en_cours" | "livre" | "erreur"> = {
    upload_en_attente: "actif", en_traitement: "en_cours", livre: "livre", erreur: "erreur",
  };
  return map[statut] || "actif";
}

export default async function DashboardPage() {
  const bypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true" ||
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement_actif, forfait_id, essais_gratuits_restants")
    .single();

  const { data: forfaitData } = profile?.forfait_id
    ? await supabase.from("forfaits").select("nom, nb_projets_mois, prix_mensuel").eq("id", profile.forfait_id).single()
    : { data: null };

  const { data: projets } = await supabase
    .from("projets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: projetsMois } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const nbMax = forfaitData?.nb_projets_mois || 3;
  const projetsRestants = profile?.abonnement_actif ? nbMax - (projetsMois || 0) : null;

  return (
    <div>
      {bypass && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <Gift className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-sm text-purple-300">
            <strong className="text-purple-200">Mode développement actif.</strong> Toutes les limitations sont désactivées.
          </div>
        </div>
      )}

      {!bypass && !profile?.abonnement_actif && (profile?.essais_gratuits_restants ?? 0) > 0 && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20">
          <Gift className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <div className="text-sm text-green-300">
            <strong>{profile?.essais_gratuits_restants} essai{profile?.essais_gratuits_restants !== 1 ? "s" : ""} gratuit{profile?.essais_gratuits_restants !== 1 ? "s" : ""} restant{profile?.essais_gratuits_restants !== 1 ? "s" : ""}.</strong>{" "}
            Testez AltiMetrix sans engagement.
          </div>
        </div>
      )}

      {!bypass && !profile?.abonnement_actif && (profile?.essais_gratuits_restants ?? 0) === 0 && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-300">
            <strong>Abonnement inactif.</strong> Vos essais gratuits sont épuisés.{" "}
            <Link href="/pricing" className="text-cyan-400 hover:underline font-medium">Voir les offres</Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Link
          href="/dashboard/nouveau-projet"
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-cyan text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4" /> Nouveau projet
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Forfait actuel</p>
          <p className="text-xl font-bold">{forfaitData?.nom || "Essai gratuit"}</p>
          {projetsRestants !== null && (
            <p className="text-xs text-gray-500 mt-1">{projetsRestants} projet(s) restant(s) ce mois</p>
          )}
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Projets ce mois</p>
          <p className="text-xl font-bold text-cyan-400">{projetsMois || 0}</p>
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">En cours</p>
          <p className="text-xl font-bold text-amber-400">{projets?.filter((p) => p.statut === "en_traitement").length || 0}</p>
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Livrés</p>
          <p className="text-xl font-bold text-green-400">{projets?.filter((p) => p.statut === "livre").length || 0}</p>
        </div>
      </div>

      <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl">
        <div className="px-6 py-4 border-b border-anthracite-700 flex items-center justify-between">
          <h2 className="font-semibold">Derniers projets</h2>
          <Link href="/dashboard/projets" className="text-sm text-cyan-400 hover:text-cyan-300">Voir tout</Link>
        </div>
        {projets && projets.length > 0 ? (
          <div className="divide-y divide-anthracite-700">
            {projets.map((projet) => (
              <div key={projet.id} className="px-6 py-4 flex items-center justify-between hover:bg-anthracite-800/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{projet.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(projet.created_at).toLocaleDateString("fr-FR")}
                    {projet.adresse && ` — ${projet.adresse}`}
                  </p>
                </div>
                <Badge status={getBadgeStatus(projet.statut)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <p className="text-gray-500 text-sm mb-4">Vous n&apos;avez pas encore de projet.</p>
            <Link
              href="/dashboard/nouveau-projet"
              className="inline-flex items-center gap-2 px-5 py-2.5 gradient-cyan text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" /> Créer un projet
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
