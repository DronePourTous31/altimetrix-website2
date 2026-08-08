"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Move3d, Map, Loader2, AlertCircle, ImageIcon } from "lucide-react";
import { getAuthToken } from "@/lib/supabase/client";

export default function ProjetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [projet, setProjet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuthToken().then(async (token) => {
      if (!token) return router.push("/auth/login");
      const res = await fetch(`/api/projets?id=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return router.push("/auth/login");
      const json = await res.json();
      if (json.projets) setProjet(json.projets);
      else setError("Projet introuvable");
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-red-400">{error}</p>
    </div>
  );

  if (!projet) return null;

  const statutLabels: Record<string, string> = {
    upload_en_attente: "Upload en attente",
    en_traitement: "En traitement",
    livre: "Livré",
    erreur: "Erreur",
  };

  const TYPE_ANALYSE_LABEL: Record<string, string> = {
    mesure: "Mesure",
    calepinage: "Mesure+",
    solaire: "Analyse solaire",
  };
  const typeLabel =
    projet.type_analyse === "calepinage" ||
    (projet.type_analyse === "mesure" && projet.option_calepinage)
      ? "Mesure+"
      : TYPE_ANALYSE_LABEL[projet.type_analyse] ?? projet.type_analyse;

  const CATEGORY_LABEL: Record<string, string> = {
    NADIR: "Vue zénithale",
    OBLIQUE1: "Oblique 1",
    OBLIQUE2: "Oblique 2",
    OBLIQUE3: "Oblique 3",
    OBLIQUE4: "Oblique 4",
  };
  const photos = Array.isArray(projet.photos_uploaded) ? projet.photos_uploaded : [];
  const photosByCategory: { category: string; label: string; items: { filename: string; url: string }[] }[] = [];
  for (const p of photos) {
    const cat = String(p?.category || "PHOTOS");
    let group = photosByCategory.find((g) => g.category === cat);
    if (!group) {
      group = { category: cat, label: CATEGORY_LABEL[cat] || cat, items: [] };
      photosByCategory.push(group);
    }
    group.items.push({ filename: String(p?.filename || "photo"), url: String(p?.url || "") });
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/dashboard/projets" className="text-sm text-gray-400 hover:text-cyan-400 flex items-center gap-1 mb-6">
        <ArrowLeft className="w-3 h-3" /> Retour aux projets
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{projet.nom}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date(projet.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            {projet.adresse && ` — ${projet.adresse}`}
            <span className="ml-2">· {typeLabel}</span>
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
          projet.statut === "livre" ? "bg-green-500/10 text-green-400 border-green-500/20" :
          projet.statut === "en_traitement" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
          projet.statut === "erreur" ? "bg-red-500/10 text-red-400 border-red-500/20" :
          "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        }`}>
          {statutLabels[projet.statut] || projet.statut}
        </span>
      </div>

      {projet.statut === "livre" && (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <a href={projet.url_3d || projet.viewer_url} target="_blank"
            className="p-6 bg-anthracite-800/30 border border-anthracite-700 rounded-xl hover:border-cyan-500/30 transition-all group">
            <Move3d className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold">Visualiseur 3D</p>
          </a>
          <a href={projet.rapport_webodm_url} target="_blank"
            className="p-6 bg-anthracite-800/30 border border-anthracite-700 rounded-xl hover:border-cyan-500/30 transition-all group">
            <FileText className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold">Rapport</p>
          </a>
          <a href={projet.url_2d || projet.rapport_url} target="_blank"
            className="p-6 bg-anthracite-800/30 border border-anthracite-700 rounded-xl hover:border-cyan-500/30 transition-all group">
            <Map className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold">Visualiseur 2D</p>
          </a>
        </div>
      )}

      {projet.statut === "livre" && Array.isArray(projet.rapports_pdf) && projet.rapports_pdf.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> Rapports d&apos;analyse
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {projet.rapports_pdf.map((r: { nom: string; url: string }) => (
              <a
                key={r.nom}
                href={r.url}
                target="_blank"
                className="flex items-center gap-3 p-4 bg-anthracite-800/30 border border-anthracite-700 rounded-xl hover:border-cyan-500/30 transition-all group"
              >
                <FileText className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.nom}</p>
                  <p className="text-xs text-gray-500">Rapport PDF</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-500 ml-auto shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {photosByCategory.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cyan-400" /> Photos du vol
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Les photos aériennes HD prises lors de votre captation. Cliquez pour agrandir.
          </p>
          {photosByCategory.map((group) => (
            <div key={group.category} className="mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{group.label} · {group.items.length}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {group.items.map((p) => (
                  <a
                    key={p.filename}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-lg bg-anthracite-800/40 border border-anthracite-700 hover:border-cyan-500/40 transition-all"
                    title={p.filename}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.filename} loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {projet.statut === "upload_en_attente" && (
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-2">Vos photos sont en cours d&apos;analyse par notre pipeline.</p>
          <p className="text-sm text-gray-500">Le modèle 3D sera disponible sous 48h. Vous recevrez une notification par email.</p>
        </div>
      )}

      {projet.statut === "en_traitement" && (
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 mb-2">Votre projet est en cours de traitement.</p>
          <p className="text-sm text-gray-500">Le modèle 3D sera disponible sous 48h.</p>
        </div>
      )}
    </div>
  );
}
