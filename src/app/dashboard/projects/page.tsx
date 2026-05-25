"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  Download,
  FileText,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";

const allProjects = [
  { id: "PRJ-001", name: "Villa Dubois - Lyon", type: "Photogrammétrie + Solaire", status: "completed", date: "2026-05-22", models: 3 },
  { id: "PRJ-002", name: "Toiture Martin - Grenoble", type: "Photogrammétrie", status: "processing", date: "2026-05-23", models: 1 },
  { id: "PRJ-003", name: "Piscine Moreau - Annecy", type: "Mesures + Implantation 3D", status: "pending", date: "2026-05-24", models: 0 },
  { id: "PRJ-004", name: "Garage Petit - Chambéry", type: "Photogrammétrie", status: "completed", date: "2026-05-20", models: 2 },
  { id: "PRJ-005", name: "Jardin Leroy - Aix-les-Bains", type: "Mesures", status: "completed", date: "2026-05-18", models: 1 },
  { id: "PRJ-006", name: "Toiture Bernard - Valence", type: "Photogrammétrie", status: "failed", date: "2026-05-15", models: 0 },
];

const statusConfig: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", label: "Terminé" },
  processing: { icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10", label: "En cours" },
  pending: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", label: "En attente" },
  failed: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Échec" },
};

export default function ProjectsPage() {
  return (
    <section className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-cyan-400 flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> Retour au dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Mes projets</h1>
              <p className="text-gray-400 mt-1">{allProjects.length} projet(s) au total</p>
            </div>
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Nouveau projet
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 bg-anthracite-800 border border-anthracite-700 rounded-xl text-sm text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
          {["Tous", "Terminés", "En cours", "En attente"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                filter === "Tous"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-anthracite-800/50 text-gray-400 border border-anthracite-700 hover:border-anthracite-600"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Projects table */}
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-anthracite-700">
                  <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Projet</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Statut</th>
                  <th className="text-left p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Modèles</th>
                  <th className="text-right p-4 text-xs text-gray-500 font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite-700">
                {allProjects.map((project) => {
                  const status = statusConfig[project.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={project.id} className="hover:bg-anthracite-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-gray-500">{project.id}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{project.type}</td>
                      <td className="p-4 text-sm text-gray-400">{project.date}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-400">{project.models}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {project.status === "completed" && (
                            <>
                              <button className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-anthracite-700 rounded-lg transition-all" title="Voir le modèle 3D">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-anthracite-700 rounded-lg transition-all" title="Télécharger">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-anthracite-700 rounded-lg transition-all" title="Rapport">
                                <FileText className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {project.status === "processing" && (
                            <button className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-anthracite-700 rounded-lg transition-all" title="Détails">
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
