"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Ruler, Sun, Sparkles, Share2, Download, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface Projet {
  id: string;
  nom: string;
  adresse: string | null;
  type_analyse: "mesure" | "solaire" | "pro";
  statut: string;
  rapport_url: string | null;
  viewer_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjetLivrableProps {
  projet: Projet;
}

function getStatutLabel(statut: string): string {
  const map: Record<string, string> = {
    upload_en_attente: "Photos uploadées",
    en_traitement: "En traitement",
    livre: "Livré",
    erreur: "Erreur",
  };
  return map[statut] || statut;
}

function getBadgeStatus(statut: string): "actif" | "en_cours" | "livre" | "erreur" {
  const map: Record<string, "actif" | "en_cours" | "livre" | "erreur"> = {
    upload_en_attente: "actif",
    en_traitement: "en_cours",
    livre: "livre",
    erreur: "erreur",
  };
  return map[statut] || "actif";
}

export default function ProjetLivrable({ projet }: ProjetLivrableProps) {
  const [tab, setTab] = useState<"viewer" | "mesures" | "solaire" | "rapport">("viewer");
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/partage/${projet.id}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* EN-TÊTE */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <Link
            href="/dashboard/projets"
            className="inline-flex items-center gap-1.5 text-sm text-dark-400 hover:text-dark-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux projets
          </Link>
          <h1 className="text-2xl font-bold text-dark-800 font-heading">{projet.nom}</h1>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-dark-400">
            <Badge status={getBadgeStatus(projet.statut)} />
            <span>{new Date(projet.created_at).toLocaleDateString("fr-FR")}</span>
            {projet.adresse && <span className="hidden sm:inline">— {projet.adresse}</span>}
            <span className="capitalize">· {projet.type_analyse}</span>
          </div>
        </div>

        {projet.statut === "livre" && (
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-200 text-dark-600 hover:bg-dark-50 text-sm font-semibold transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {copied ? "Lien copié !" : "Partager"}
            </button>
            {projet.rapport_url && (
              <a
                href={projet.rapport_url}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-sm font-semibold transition-colors"
              >
                <Download className="w-4 h-4" /> Rapport PDF
              </a>
            )}
          </div>
        )}
      </div>

      {/* STATUT EN ATTENTE / TRAITEMENT */}
      {projet.statut !== "livre" && (
        <div className="bg-white rounded-xl border border-dark-100 p-8 text-center space-y-4">
          {projet.statut === "upload_en_attente" && (
            <>
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto" />
              <div>
                <h2 className="text-lg font-semibold text-dark-800 mb-1">Photos uploadées</h2>
                <p className="text-sm text-dark-400">Nos équipes vont traiter votre projet sous 48h ouvrées.</p>
              </div>
            </>
          )}
          {projet.statut === "en_traitement" && (
            <>
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto" />
              <div>
                <h2 className="text-lg font-semibold text-dark-800 mb-1">Traitement en cours</h2>
                <p className="text-sm text-dark-400">
                  Votre projet est en cours de traitement par nos algorithmes. Vous serez notifié par email dès sa livraison.
                </p>
              </div>
            </>
          )}
          {projet.statut === "erreur" && (
            <>
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <div>
                <h2 className="text-lg font-semibold text-dark-800 mb-1">Erreur de traitement</h2>
                <p className="text-sm text-dark-400">
                  Une erreur est survenue. Notre équipe technique a été notifiée. Veuillez contacter le support.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* PROJET LIVRÉ */}
      {projet.statut === "livre" && (
        <>
          {/* TABS */}
          <div className="flex border-b border-dark-100 mb-6 overflow-x-auto">
            {[
              { key: "viewer" as const, label: "Visualisation 3D" },
              { key: "mesures" as const, label: "Mesures" },
              ...(projet.type_analyse === "solaire" || projet.type_analyse === "pro"
                ? [{ key: "solaire" as const, label: "Analyse solaire" }] : []),
              { key: "rapport" as const, label: "Rapports" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  tab === t.key
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-dark-400 hover:text-dark-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB: VIEWER 3D */}
          {tab === "viewer" && (
            <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
              <div className="aspect-video bg-dark-900 relative">
                {projet.viewer_url ? (
                  <iframe
                    src={projet.viewer_url}
                    className="w-full h-full border-0"
                    allowFullScreen
                    title="Visualisation 3D"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-dark-400">
                    <p className="text-sm">Visualiseur non disponible</p>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-dark-400">
                  Modèle 3D généré par photogrammétrie &bull; Utilisez la souris pour naviguer
                </p>
                {projet.viewer_url && (
                  <a
                    href={projet.viewer_url}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dark-200 text-dark-600 hover:bg-dark-50 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Plein écran
                  </a>
                )}
              </div>
            </div>
          )}

          {/* TAB: MESURES */}
          {tab === "mesures" && (
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <div className="flex items-start gap-4 mb-6">
                <Ruler className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-dark-800">Outils de mesure</h3>
                  <p className="text-sm text-dark-400 mt-1">
                    Utilisez le visualiseur 3D pour prendre des mesures directement sur le modèle. Cliquez sur l&apos;icône
                    règle dans le visualiseur pour activer l&apos;outil de mesure.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-dark-50 border border-dark-100">
                  <p className="text-xs text-dark-400">Mode d&apos;emploi</p>
                  <ol className="mt-2 space-y-1.5 text-sm text-dark-600 list-decimal list-inside">
                    <li>Ouvrir le visualiseur 3D</li>
                    <li>Cliquer sur l&apos;icône règle</li>
                    <li>Cliquer deux points sur le modèle</li>
                    <li>La distance s&apos;affiche en temps réel</li>
                  </ol>
                </div>
                <div className="p-4 rounded-xl bg-dark-50 border border-dark-100">
                  <p className="text-xs text-dark-400">Export des mesures</p>
                  <p className="text-sm text-dark-600 mt-2">
                    Les mesures peuvent être exportées au format CSV ou intégrées dans le rapport PDF.
                  </p>
                  <button className="mt-3 text-xs text-primary-600 font-semibold hover:underline">
                    Exporter mes mesures
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SOLAIRE */}
          {tab === "solaire" && (
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <div className="flex items-start gap-4 mb-6">
                <Sun className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-dark-800">Analyse solaire & calepinage</h3>
                  <p className="text-sm text-dark-400 mt-1">
                    Visualisez l&apos;irradiation solaire et le calepinage photovoltaïque.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-6 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-2xl font-bold text-amber-600">1 240</p>
                  <p className="text-xs text-amber-700 mt-1">kWh/m²/an</p>
                  <p className="text-xs text-amber-500">Irradiation globale</p>
                </div>
                <div className="p-6 rounded-xl bg-primary-50 border border-primary-200">
                  <p className="text-2xl font-bold text-primary-600">32</p>
                  <p className="text-xs text-primary-700 mt-1">Panneaux</p>
                  <p className="text-xs text-primary-500">Calepinage optimal</p>
                </div>
                <div className="p-6 rounded-xl bg-green-50 border border-green-200">
                  <p className="text-2xl font-bold text-green-600">12.8</p>
                  <p className="text-xs text-green-700 mt-1">kWc</p>
                  <p className="text-xs text-green-500">Puissance installée</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: RAPPORTS */}
          {tab === "rapport" && (
            <div className="bg-white rounded-xl border border-dark-100 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={projet.rapport_url || "#"}
                  target="_blank"
                  className={`p-6 rounded-xl border-2 border-dark-100 hover:border-primary-500 transition-colors ${
                    !projet.rapport_url ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <Download className="w-6 h-6 text-dark-400 mb-3" />
                  <p className="font-semibold text-dark-800">Rapport technique</p>
                  <p className="text-xs text-dark-400 mt-1">PDF complet (modèle 3D, mesures, analyses)</p>
                </a>
                <div className="p-6 rounded-xl border-2 border-dashed border-dark-100 hover:border-dark-300 transition-colors cursor-pointer">
                  <CheckCircle2 className="w-6 h-6 text-dark-400 mb-3" />
                  <p className="font-semibold text-dark-800">Données brutes</p>
                  <p className="text-xs text-dark-400 mt-1">Export ZIP des fichiers sources</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
