import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Move3d, Ruler, Sun } from "lucide-react";

export default async function ProjetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const { data: projet } = await supabase.from("projets").select("*").eq("id", id).eq("user_id", user.id).single();
  if (!projet) notFound();

  const statutLabels: Record<string, string> = {
    upload_en_attente: "Upload en attente",
    en_traitement: "En traitement",
    livre: "Livré",
    erreur: "Erreur",
  };

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
            <span className="ml-2 capitalize">· {projet.type_analyse}</span>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {projet.viewer_url && (
            <a href={projet.viewer_url} target="_blank"
              className="p-5 bg-anthracite-800/30 border border-anthracite-700 rounded-xl hover:border-cyan-500/30 transition-all group">
              <Move3d className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold mb-1">Visualiseur 3D</p>
              <p className="text-xs text-gray-500">Ouvrir le modèle 3D interactif</p>
            </a>
          )}
          {projet.rapport_url && (
            <a href={projet.rapport_url} target="_blank"
              className="p-5 bg-anthracite-800/30 border border-anthracite-700 rounded-xl hover:border-cyan-500/30 transition-all group">
              <FileText className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold mb-1">Rapport</p>
              <p className="text-xs text-gray-500">Télécharger le rapport PDF</p>
            </a>
          )}
          <div className="p-5 bg-anthracite-800/30 border border-anthracite-700 rounded-xl group">
            <Ruler className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold mb-1">Outils de mesure</p>
            <p className="text-xs text-gray-500">Accéder aux mesures en ligne</p>
          </div>
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
