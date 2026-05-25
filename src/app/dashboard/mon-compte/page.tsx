import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { User, CreditCard, History, ArrowRight } from "lucide-react";

export default async function MonComptePage() {
  const h = await headers();
  const userId = h.get("x-user-id");
  const userEmail = h.get("x-user-email") || "";
  if (!userId) redirect("/auth/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, nom, type_compte, siret, telephone, created_at, abonnement_actif, forfait_id, essais_gratuits_restants")
    .eq("id", userId)
    .single();

  const { data: forfait } = profile?.forfait_id
    ? await supabase.from("forfaits").select("nom, prix_mensuel, nb_projets_mois").eq("id", profile.forfait_id).single()
    : { data: null };

  const { data: commandes } = await supabase
    .from("commandes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Mon compte</h1>

      <div className="space-y-6">
        {/* Profile info */}
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" /> Informations personnelles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Prénom</p>
              <p className="font-medium mt-0.5">{profile?.prenom || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Nom</p>
              <p className="font-medium mt-0.5">{profile?.nom || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="font-medium mt-0.5">{userEmail}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Type de compte</p>
              <p className="font-medium mt-0.5 capitalize">{profile?.type_compte === "artisan" ? "Artisan / Pro" : "Particulier"}</p>
            </div>
            {profile?.siret && (
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-xs">SIRET</p>
                <p className="font-medium mt-0.5">{profile.siret}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-xs">Membre depuis</p>
              <p className="font-medium mt-0.5">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" /> Abonnement
          </h2>
          <div className="flex items-center justify-between p-4 bg-anthracite-800 rounded-xl border border-anthracite-700">
            <div>
              <p className="font-medium">{forfait?.nom || (profile?.abonnement_actif ? "Forfait actif" : "Essai gratuit")}</p>
              {forfait ? (
                <p className="text-sm text-gray-500">{forfait.prix_mensuel / 100}€/mois — {forfait.nb_projets_mois} projets/mois</p>
              ) : (
                <p className="text-sm text-gray-500">{profile?.essais_gratuits_restants || 0} essai(s) gratuit(s) restant(s)</p>
              )}
            </div>
            <Link href="/pricing"
              className="px-4 py-2 text-sm border border-anthracite-700 text-gray-300 rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all">
              {profile?.abonnement_actif ? "Changer" : "Souscrire"}
            </Link>
          </div>
        </div>

        {/* Order history */}
        {commandes && commandes.length > 0 && (
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" /> Historique des commandes
            </h2>
            <div className="space-y-2">
              {commandes.map((cmd) => (
                <div key={cmd.id} className="flex items-center justify-between p-3 bg-anthracite-800 rounded-xl border border-anthracite-700 text-sm">
                  <div>
                    <p className="font-medium">{new Date(cmd.created_at).toLocaleDateString("fr-FR")}</p>
                    <p className="text-xs text-gray-500">{cmd.montant / 100}€</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    cmd.statut === "payee" ? "bg-green-500/10 text-green-400" :
                    cmd.statut === "echec" ? "bg-red-500/10 text-red-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {cmd.statut === "payee" ? "Payée" : cmd.statut === "echec" ? "Échec" : "En attente"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
