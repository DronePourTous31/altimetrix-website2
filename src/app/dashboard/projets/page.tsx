import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import { Eye, FileText, Plus } from "lucide-react";

function getBadgeStatus(statut: string): "actif" | "en_cours" | "livre" | "erreur" {
  const map: Record<string, "actif" | "en_cours" | "livre" | "erreur"> = {
    upload_en_attente: "actif", en_traitement: "en_cours", livre: "livre", erreur: "erreur",
  };
  return map[statut] || "actif";
}

export default async function ProjetsPage({ searchParams }: { searchParams: Promise<{ statut?: string; type?: string }> }) {
  const h = await headers();
  const userId = h.get("x-user-id");
  if (!userId) redirect("/auth/login");

  const supabase = await createClient();
  const params = await searchParams;
  let query = supabase.from("projets").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (params.statut) query = query.eq("statut", params.statut);
  if (params.type) query = query.eq("type_analyse", params.type);
  const { data: projets } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes projets</h1>
        <Link href="/dashboard/nouveau-projet"
          className="inline-flex items-center gap-2 px-5 py-2.5 gradient-cyan text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25">
          <Plus className="w-4 h-4" /> Nouveau projet
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: "Tous", href: "/dashboard/projets", active: !params.statut && !params.type },
          { label: "Photos uploadées", href: "/dashboard/projets?statut=upload_en_attente", active: params.statut === "upload_en_attente" },
          { label: "En traitement", href: "/dashboard/projets?statut=en_traitement", active: params.statut === "en_traitement" },
          { label: "Livré", href: "/dashboard/projets?statut=livre", active: params.statut === "livre" },
          { label: "Erreur", href: "/dashboard/projets?statut=erreur", active: params.statut === "erreur" },
        ].map((f) => (
          <Link key={f.label} href={f.href}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              f.active ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-anthracite-800 text-gray-400 border border-anthracite-700 hover:border-anthracite-600"
            }`}>
            {f.label}
          </Link>
        ))}
      </div>

      {projets && projets.length > 0 ? (
        <div className="space-y-3">
          {projets.map((projet) => (
            <div key={projet.id} className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-cyan-500/30 transition-all">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-sm truncate">{projet.nom}</h3>
                  <Badge status={getBadgeStatus(projet.statut)} />
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(projet.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  {projet.adresse && ` — ${projet.adresse}`}
                  <span className="ml-2 capitalize">· {projet.type_analyse}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {projet.statut === "livre" && (
                  <>
                    <Link href={`/dashboard/projets/${projet.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-all">
                      <Eye className="w-3.5 h-3.5" /> Voir
                    </Link>
                    {projet.rapport_url && (
                      <a href={projet.rapport_url} target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-anthracite-700 text-gray-400 hover:text-white text-xs font-semibold transition-all">
                        <FileText className="w-3.5 h-3.5" /> Rapport
                      </a>
                    )}
                  </>
                )}
                {projet.statut === "upload_en_attente" && (
                  <Link href={`/dashboard/projets/${projet.id}`} className="text-xs text-cyan-400 hover:text-cyan-300">Détails</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">Aucun projet trouvé.</p>
          <Link href="/dashboard/nouveau-projet"
            className="inline-flex items-center gap-2 px-5 py-2.5 gradient-cyan text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /> Créer un projet
          </Link>
        </div>
      )}
    </div>
  );
}
