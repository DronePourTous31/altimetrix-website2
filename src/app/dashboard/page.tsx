import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Plus, AlertTriangle, Gift } from "lucide-react";
import Badge from "@/components/ui/Badge";

function getBadgeStatus(statut: string): "actif" | "en_cours" | "livre" | "erreur" {
  const map: Record<string, "actif" | "en_cours" | "livre" | "erreur"> = {
    upload_en_attente: "actif",
    en_traitement: "en_cours",
    livre: "livre",
    erreur: "erreur",
  };
  return map[statut] || "actif";
}

function getStatutLabel(statut: string): string {
  const map: Record<string, string> = {
    upload_en_attente: "Upload en attente",
    en_traitement: "En traitement",
    livre: "Livré",
    erreur: "Erreur",
  };
  return map[statut] || statut;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const bypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement_actif, forfait_id, essais_gratuits_restants")
    .eq("id", user.id)
    .single();

  const { data: forfait } = await supabase
    .from("forfaits")
    .select("nom, nb_projets_mois, prix_mensuel")
    .eq("id", profile?.forfait_id || "")
    .single();

  const { data: projets } = await supabase
    .from("projets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { count: projetsMois } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const projetsRestants = forfait ? forfait.nb_projets_mois - (projetsMois || 0) : null;

  return (
    <div>
      {/* BANDEAU MODE DÉV */}
      {bypass && (
        <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-purple-50 border border-purple-200">
          <Gift className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-sm text-purple-800">
            <strong>Mode développement actif.</strong> Toutes les limitations sont désactivées.
          </div>
        </div>
      )}
      {/* BANDEAU ESSAIS GRATUITS */}
      {!bypass && !profile?.abonnement_actif && (profile?.essais_gratuits_restants ?? 0) > 0 && (
        <div className="flex items-start gap-3 p-4 mb-4 rounded-xl bg-green-50 border border-green-200">
          <Gift className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <strong>{profile?.essais_gratuits_restants} essai{profile?.essais_gratuits_restants !== 1 ? "s" : ""} gratuit{profile?.essais_gratuits_restants !== 1 ? "s" : ""} restant{profile?.essais_gratuits_restants !== 1 ? "s" : ""}.</strong>{" "}
            Testez AltiMetrix sans engagement — créez un projet et recevez un modèle 3D complet.
          </div>
        </div>
      )}
      {/* BANDEAU ABONNEMENT INACTIF / PLUS D'ESSAIS */}
      {!bypass && !profile?.abonnement_actif && (profile?.essais_gratuits_restants ?? 0) === 0 && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Abonnement inactif.</strong>{" "}
            Vos essais gratuits sont épuisés.{" "}
            <Link href="/tarifs" className="text-primary-600 hover:underline font-medium">
              Voir les offres
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark-800 font-heading">Tableau de bord</h1>
        <Link
          href="/dashboard/nouveau-projet"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-primary-600/25"
        >
          <Plus className="w-4 h-4" /> Nouveau projet
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-dark-100 p-5">
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-1">Forfait actuel</p>
          <p className="text-xl font-bold text-dark-800">{forfait?.nom || "Aucun"}</p>
        </div>
        <div className="bg-white rounded-xl border border-dark-100 p-5">
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-1">Projets ce mois</p>
          <p className="text-xl font-bold text-dark-800">{projetsMois || 0}</p>
          {projetsRestants !== null && (
            <p className="text-xs text-dark-400 mt-0.5">{projetsRestants} restant(s)</p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-dark-100 p-5">
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-1">En cours</p>
          <p className="text-xl font-bold text-amber-600">
            {projets?.filter((p) => p.statut === "en_traitement").length || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-dark-100 p-5">
          <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-1">Livrés</p>
          <p className="text-xl font-bold text-green-600">
            {projets?.filter((p) => p.statut === "livre").length || 0}
          </p>
        </div>
      </div>

      {/* DERNIERS PROJETS */}
      <div className="bg-white rounded-xl border border-dark-100">
        <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between">
          <h2 className="font-semibold text-dark-800">Derniers projets</h2>
          <Link href="/dashboard/projets" className="text-sm text-primary-600 hover:underline">
            Voir tout
          </Link>
        </div>
        {projets && projets.length > 0 ? (
          <div className="divide-y divide-dark-100">
            {projets.map((projet) => (
              <div key={projet.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-dark-800 text-sm">{projet.nom}</p>
                  <p className="text-xs text-dark-400 mt-0.5">
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
            <p className="text-dark-500 text-sm mb-4">Vous n&apos;avez pas encore de projet.</p>
            <Link
              href="/dashboard/nouveau-projet"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Créer un projet
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
