"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, AlertCircle, TrendingUp, Users, FolderOpen, CheckCircle2, CreditCard, Download, BarChart3 } from "lucide-react";
import { getAuthToken } from "@/lib/supabase/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  upload_en_attente: "#06b6d4",
  en_traitement: "#f59e0b",
  livre: "#22c55e",
  erreur: "#ef4444",
};

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-4">
      {icon}
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuthToken().then(async (token) => {
      if (!token) return router.push("/auth/login");
      const res = await fetch("/api/admin/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) return router.push("/dashboard");
      const json = await res.json();
      if (json.error) setError(json.error);
      else setData(json);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { stats, monthlyData, projectsByStatus, clients, projets } = data;

  const pieData = projectsByStatus.map((item: any) => ({
    name:
      item.statut === "upload_en_attente"
        ? "En attente"
        : item.statut === "en_traitement"
          ? "En cours"
          : item.statut === "livre"
            ? "Livré"
            : "Erreur",
    value: item.count,
    color: STATUS_COLORS[item.statut] || "#6b7280",
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <Shield className="w-6 h-6 text-cyan-400" /> Administration — Bilan d&apos;activité
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users className="w-5 h-5 text-cyan-400" />} label="Clients" value={stats.total_users} />
        <StatCard icon={<FolderOpen className="w-5 h-5 text-cyan-400" />} label="Projets" value={stats.total_projets} />
        <StatCard icon={<CheckCircle2 className="w-5 h-5 text-green-400" />} label="Livrés" value={stats.total_livres} />
        <StatCard icon={<span className="text-yellow-400 text-lg">€</span>} label="Revenu mensuel (abonnements)" value={`${stats.total_revenu_mensuel.toLocaleString("fr-FR")} €`} />
        <StatCard icon={<span className="text-green-400 text-lg">€</span>} label="Encaissé ce mois-ci" value={`${stats.encaisse_mois.toLocaleString("fr-FR")} €`} />
        <StatCard icon={<span className="text-emerald-400 text-lg">€</span>} label="Encaissé (total)" value={`${stats.total_encaisse.toLocaleString("fr-FR")} €`} />
        <StatCard icon={<BarChart3 className="w-5 h-5 text-amber-400" />} label="En cours" value={stats.total_en_cours} />
        <StatCard icon={<BarChart3 className="w-5 h-5 text-cyan-400" />} label="En attente" value={stats.total_attente} />
        <StatCard icon={<CreditCard className="w-5 h-5 text-purple-400" />} label="Abonnements actifs" value={stats.abonnements_actifs} />
        <StatCard icon={<AlertCircle className="w-5 h-5 text-red-400" />} label="Erreurs" value={stats.total_erreur} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Projets par mois
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="projets" name="Créés" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="livres" name="Livrés" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="text-yellow-400">€</span> Revenus mensuels
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, color: "#fff" }}
                formatter={(v, name) => [`${Number(v).toLocaleString("fr-FR")} €`, name]}
              />
              <Legend />
              <Area type="monotone" dataKey="encaissements" name="Encaissements réels" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
              <Area type="monotone" dataKey="revenu" name="Abonnements (est.)" stroke="#eab308" strokeWidth={2} dot={{ fill: "#eab308" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-4">Projets par statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={95}
                dataKey="value"
                labelLine
                label={({ name, percent }) => `${(100 * (percent || 0)).toFixed(0)}%`}
              >
                {pieData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }}
                formatter={(value, name) => [`${value} projet(s)`, name]}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(e) => <span className="text-white text-xs">{e}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-4">Derniers projets</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-anthracite-700">
                  <th className="text-left py-2 px-2">Client</th>
                  <th className="text-left py-2 px-2">Projet</th>
                  <th className="text-left py-2 px-2">Statut</th>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-right py-2 px-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {projets.slice(0, 10).map((p: any) => (
                  <tr key={p.id} className="border-b border-anthracite-700/50 hover:bg-anthracite-800/50">
                    <td className="py-2.5 px-2">
                      {p.client ? `${p.client.prenom} ${p.client.nom}` : "—"}
                    </td>
                    <td className="py-2.5 px-2 font-medium">{p.nom}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          p.statut === "livre"
                            ? "bg-green-500/10 text-green-400"
                            : p.statut === "en_traitement"
                              ? "bg-amber-500/10 text-amber-400"
                              : p.statut === "erreur"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-cyan-500/10 text-cyan-400"
                        }`}
                      >
                        {p.statut === "upload_en_attente"
                          ? "En attente"
                          : p.statut === "en_traitement"
                            ? "En cours"
                            : p.statut === "livre"
                              ? "Livré"
                              : p.statut}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-gray-400 text-xs">
                      {new Date(p.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-2 text-right text-gray-400 text-xs">{p.type_analyse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
        <h2 className="text-sm font-semibold mb-4">Clients</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-anthracite-700">
                <th className="text-left py-2 px-2">Nom</th>
                <th className="text-left py-2 px-2">Email</th>
                <th className="text-center py-2 px-2">Forfait</th>
                <th className="text-center py-2 px-2">Restants</th>
                <th className="text-center py-2 px-2">Abonnement</th>
                <th className="text-center py-2 px-2">Total Abonnements</th>
                <th className="text-center py-2 px-2">Achats hors abonnement</th>
                <th className="text-center py-2 px-2">Total Achats</th>
                <th className="text-center py-2 px-2">Projets</th>
                <th className="text-center py-2 px-2">Livrés</th>
                <th className="text-center py-2 px-2">Abonné</th>
                <th className="text-right py-2 px-2">Inscription</th>
                <th className="text-right py-2 px-2">Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c: any) => (
                <tr key={c.id} className="border-b border-anthracite-700/50 hover:bg-anthracite-800/50">
                  <td className="py-2.5 px-2 font-medium">{c.prenom} {c.nom}</td>
                  <td className="py-2.5 px-2 text-gray-400 text-xs">{c.email}</td>
                  <td className="py-2.5 px-2 text-center">
                    {c.forfaits_noms?.length ? (
                      <span className="flex items-center justify-center gap-1.5 flex-wrap">
                        <span className="text-xs">{c.forfaits_noms.join(" + ")}</span>
                        {c.forfaits_noms.length > 1 && (
                          <span
                            className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full"
                            title={c.forfaits_noms.join(" + ")}
                          >
                            {c.forfaits_noms.length}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center text-xs">
                    {c.projets_restants_forfait !== null ? (
                      <span className="text-cyan-400">{c.projets_restants_forfait}/{c.forfait_nb_projets}</span>
                    ) : c.essais_gratuits_restants > 0 ? (
                      <span className="text-gray-400">{c.essais_gratuits_restants} gratuit{c.essais_gratuits_restants > 1 ? "s" : ""}</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center text-yellow-400 text-xs">
                    {c.total_abonnement > 0 ? `${c.total_abonnement.toLocaleString("fr-FR")} €` : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-2.5 px-2 text-center text-yellow-400 text-xs">
                    {c.total_abonnements > 0 ? `${c.total_abonnements.toLocaleString("fr-FR")} €` : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-2.5 px-2 text-center text-cyan-400 text-xs">
                    {c.achats_hors_abonnement > 0 ? `${c.achats_hors_abonnement.toLocaleString("fr-FR")} €` : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-2.5 px-2 text-center text-emerald-400 text-xs font-semibold">
                    {c.total_achats > 0 ? `${c.total_achats.toLocaleString("fr-FR")} €` : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="py-2.5 px-2 text-center">{c.nb_projets}</td>
                  <td className="py-2.5 px-2 text-center text-green-400">{c.nb_projets_livres}</td>
                  <td className="py-2.5 px-2 text-center">
                    {c.abonnement_actif ? (
                      <span className="text-green-400 text-xs">Oui</span>
                    ) : (
                      <span className="text-gray-500 text-xs">Non</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-right text-gray-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-2.5 px-2 text-right text-gray-400 text-xs">
                    {c.derniere_activite
                      ? new Date(c.derniere_activite).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">{clients.length} clients</p>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 text-sm border border-anthracite-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export PDF
        </button>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 text-sm border border-anthracite-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>
    </div>
  );
}
