import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import { Eye, FileText, ExternalLink, Plus } from "lucide-react";

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
    upload_en_attente: "Photos uploadées",
    en_traitement: "En traitement",
    livre: "Livré",
    erreur: "Erreur",
  };
  return map[statut] || statut;
}

export default async function ProjetsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string; type?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const filtreStatut = params.statut || "";
  const filtreType = params.type || "";

  let query = supabase
    .from("projets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filtreStatut) query = query.eq("statut", filtreStatut);
  if (filtreType) query = query.eq("type_analyse", filtreType);

  const { data: projets } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-dark-800 font-heading">Mes projets</h1>
        <Link
          href="/dashboard/nouveau-projet"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-primary-600/25"
        >
          <Plus className="w-4 h-4" /> Nouveau projet
        </Link>
      </div>

      {/* FILTRES */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: "Tous", href: "/dashboard/projets", active: !filtreStatut && !filtreType },
          { label: "Photos uploadées", href: "/dashboard/projets?statut=upload_en_attente", active: filtreStatut === "upload_en_attente" },
          { label: "En traitement", href: "/dashboard/projets?statut=en_traitement", active: filtreStatut === "en_traitement" },
          { label: "Livré", href: "/dashboard/projets?statut=livre", active: filtreStatut === "livre" },
          { label: "Erreur", href: "/dashboard/projets?statut=erreur", active: filtreStatut === "erreur" },
        ].map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              f.active ? "bg-dark-800 text-white" : "bg-dark-100 text-dark-600 hover:bg-dark-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* LISTE */}
      {projets && projets.length > 0 ? (
        <div className="space-y-3">
          {projets.map((projet) => (
            <div
              key={projet.id}
              className="bg-white rounded-xl border border-dark-100 p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-dark-800 text-sm truncate">{projet.nom}</h3>
                  <Badge status={getBadgeStatus(projet.statut)} />
                </div>
                <p className="text-xs text-dark-400">
                  {new Date(projet.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                  {projet.adresse && ` — ${projet.adresse}`}
                  <span className="ml-2 capitalize">· {projet.type_analyse}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {projet.statut === "livre" && (
                  <>
                    <Link
                      href={`/dashboard/projets/${projet.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Voir
                    </Link>
                    {projet.rapport_url && (
                      <a
                        href={projet.rapport_url}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-100 text-dark-600 hover:bg-dark-200 text-xs font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" /> Rapport
                      </a>
                    )}
                  </>
                )}
                {projet.statut === "upload_en_attente" && (
                  <Link
                    href={`/dashboard/projets/${projet.id}`}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Détails
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dark-100 p-12 text-center">
          <p className="text-dark-500 mb-4">Aucun projet trouvé.</p>
          <Link
            href="/dashboard/nouveau-projet"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Créer un projet
          </Link>
        </div>
      )}
    </div>
  );
}
