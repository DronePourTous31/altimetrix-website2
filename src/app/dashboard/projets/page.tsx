"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, FileText, Trash2, Plus, Loader2, AlertCircle } from "lucide-react";
import { getAuthToken } from "@/lib/supabase/client";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    actif: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    en_cours: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    livre: "bg-green-500/10 text-green-400 border-green-500/20",
    erreur: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const defaultLabels: Record<string, string> = {
    actif: "Upload en attente",
    en_cours: "En traitement",
    livre: "Livré",
    erreur: "Erreur",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
        styles[status] || styles.actif
      }`}
    >
      {defaultLabels[status] || status}
    </span>
  );
}

const statusMap: Record<string, string> = {
  upload_en_attente: "actif",
  en_traitement: "en_cours",
  livre: "livre",
  erreur: "erreur",
};

// Libellés métier : un projet « calepinage » est un « Mesure+ » (Métrés &
// mesures + calepinage 3D), distinct du « Mesure » seul.
const TYPE_ANALYSE_LABEL: Record<string, string> = {
  mesure: "Mesure",
  calepinage: "Mesure+",
  solaire: "Analyse solaire",
};

function typeAnalyseLabel(projet: any): string {
  if (projet.type_analyse === "calepinage") return "Mesure+";
  if (projet.type_analyse === "mesure" && projet.option_calepinage) return "Mesure+";
  return TYPE_ANALYSE_LABEL[projet.type_analyse] ?? projet.type_analyse;
}

export default function ProjetsPage() {
  const router = useRouter();
  const [projets, setProjets] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuthToken().then((token) => {
      if (!token) {
        setError("Session introuvable. Reconnectez-vous.");
        return;
      }
      fetch("/api/projets", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.status === 401) return router.push("/auth/login");
          return res.json();
        })
        .then((data) => {
          if (data?.projets) {
            setProjets(data.projets);
          } else {
            setError("Erreur chargement projets");
          }
        })
        .catch(() => setError("Erreur réseau"));
    });
  }, []);

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-red-400">{error}</p>
      </div>
    );

  if (!projets)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes projets</h1>
        <Link
          href="/dashboard/nouveau-projet"
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-cyan text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4" /> Nouveau projet
        </Link>
      </div>

      {projets.length > 0 ? (
        <div className="space-y-3">
          {projets.map((projet) => (
            <div
              key={projet.id}
              className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-cyan-500/30 transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-sm truncate">{projet.nom}</h3>
                  <StatusBadge status={statusMap[projet.statut] || "actif"} />
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(projet.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {projet.adresse && ` • ${projet.adresse}`}
                  <span className="ml-2">• {typeAnalyseLabel(projet)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {projet.statut === "livre" ? (
                  <>
                    <Link
                      href={`/dashboard/projets/${projet.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Voir
                    </Link>
                    {projet.rapport_webodm_url && (
                      <a
                        href={projet.rapport_webodm_url}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-anthracite-700 text-gray-400 hover:text-white text-xs font-semibold transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" /> Rapport
                      </a>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/dashboard/projets/${projet.id}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Détails
                  </Link>
                )}

                <button
                  onClick={async () => {
                    const token = await getAuthToken();
                    if (!token) return;
                    if (
                      confirm(
                        `Supprimer le projet "${projet.nom}" ?\n\nToutes les données (photos, modèles 3D, rapports) seront définitivement effacées.`
                      )
                    ) {
                      const res = await fetch(`/api/projets?id=${projet.id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) setProjets((prev) => prev?.filter((p) => p.id !== projet.id) ?? prev);
                    }
                  }}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">Aucun projet trouvé.</p>
          <Link
            href="/dashboard/nouveau-projet"
            className="inline-flex items-center gap-2 px-5 py-2.5 gradient-cyan text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Créer un projet
          </Link>
        </div>
      )}
    </div>
  );
}
