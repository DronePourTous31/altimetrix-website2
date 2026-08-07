"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAuthToken } from "@/lib/supabase/client";
import Badge from "@/components/ui/Badge";

const STATUS_MAP: Record<string, string> = {
  upload_en_attente: "actif",
  en_traitement: "en_cours",
  livre: "livre",
  erreur: "erreur",
};

export default function DashboardPage() {
  const router = useRouter();
  const [projets, setProjets] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "success") {
      setSuccess("Paiement réussi ! Votre abonnement est en cours d'activation.");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  useEffect(() => {
    getAuthToken().then((token) => {
      if (!token) {
        setError("Session introuvable. Reconnectez-vous.");
        return;
      }
      fetch("/api/projets", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.status === 401) return router.push("/auth/login");
          return res.json();
        })
        .then((data) => {
          if (data?.projets) setProjets(data.projets);
          else setError("Erreur chargement");
        })
        .catch(() => setError("Erreur réseau"));
    });
  }, []);

  const now = new Date();
  const projetsThisMonth =
    projets?.filter((p) => {
      const d = new Date(p.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length || 0;
  const enCours = projets?.filter((p) => p.statut === "en_traitement").length || 0;
  const livres = projets?.filter((p) => p.statut === "livre").length || 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!projets) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div>
      {success && (
        <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-5 py-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm">{success}</p>
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
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total projets</p>
          <p className="text-xl font-bold">{projets.length}</p>
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Projets ce mois</p>
          <p className="text-xl font-bold text-cyan-400">{projetsThisMonth}</p>
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">En cours</p>
          <p className="text-xl font-bold text-amber-400">{enCours}</p>
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Livrés</p>
          <p className="text-xl font-bold text-green-400">{livres}</p>
        </div>
      </div>

      <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl">
        <div className="px-6 py-4 border-b border-anthracite-700 flex items-center justify-between">
          <h2 className="font-semibold">Derniers projets</h2>
          <Link href="/dashboard/projets" className="text-sm text-cyan-400 hover:text-cyan-300">
            Voir tout
          </Link>
        </div>
        {projets.length > 0 ? (
          <div className="divide-y divide-anthracite-700">
            {projets.slice(0, 5).map((projet) => (
              <div key={projet.id} className="px-6 py-4 flex items-center justify-between hover:bg-anthracite-800/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{projet.nom}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(projet.created_at).toLocaleDateString("fr-FR")}
                    {projet.adresse && ` — ${projet.adresse}`}
                  </p>
                </div>
                <Badge status={STATUS_MAP[projet.statut] as "actif" | "en_cours" | "livre" | "erreur"} />
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
