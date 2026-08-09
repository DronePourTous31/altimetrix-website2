"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, AlertCircle, TrendingUp, Users, FolderOpen, CheckCircle2, CreditCard, Download, BarChart3, MapPin, X, ChevronDown, ChevronUp, ExternalLink, FileText, Upload } from "lucide-react";
import { getAuthToken } from "@/lib/supabase/client";
import UploadZone from "@/components/projects/UploadZone";
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

const DEMANDE_STATUS: Record<string, { label: string; cls: string }> = {
  en_attente: { label: "En attente", cls: "bg-cyan-500/10 text-cyan-400" },
  validee: { label: "Validée", cls: "bg-green-500/10 text-green-400" },
  refusee: { label: "Refusée", cls: "bg-red-500/10 text-red-400" },
  payee: { label: "Payée", cls: "bg-purple-500/10 text-purple-400" },
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

interface Demande {
  id: string;
  plan_id: string;
  plan_nom: string;
  adresse: string;
  code_postal: string;
  ville: string;
  hors_zone: boolean;
  description: string | null;
  statut: string;
  stripe_session_id: string | null;
  created_at: string;
  email: string;
  client: { prenom?: string; nom?: string } | null;
  projet: { id: string; nom: string; statut: string; type_analyse: string; adresse: string | null; created_at: string; delivered_at: string | null; rapports_pdf?: { nom: string; url: string }[] } | null;
}

const PROJET_LABEL: Record<string, { label: string; cls: string }> = {
  upload_en_attente: { label: "Photos en attente", cls: "bg-cyan-500/10 text-cyan-400" },
  en_traitement: { label: "En traitement", cls: "bg-amber-500/10 text-amber-400" },
  livre: { label: "Livré", cls: "bg-green-500/10 text-green-400" },
  erreur: { label: "Erreur", cls: "bg-red-500/10 text-red-400" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadDemandes = (token: string) => {
    return fetch("/api/admin/demandes", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 403) { router.push("/dashboard"); return; }
        const json = await res.json();
        if (json.error) { setError(json.error); return; }
        setDemandes(json.demandes || []);
      });
  };

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
      await loadDemandes(token);
      setLoading(false);
    });
  }, []);

  const decideDemande = async (id: string, action: "valider" | "refuser") => {
    setActionBusy(id);
    setActionError("");
    const token = await getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/demandes/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) { setActionError(json.error || "Erreur lors de l'action"); return; }
      await loadDemandes(token);
    } catch {
      setActionError("Erreur réseau");
    } finally {
      setActionBusy(null);
    }
  };

  const createProjet = async (id: string) => {
    setActionBusy(id);
    setActionError("");
    const token = await getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/demandes/${id}/projet`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) { setActionError(json.error || "Erreur lors de la création du projet"); return; }
      await loadDemandes(token);
      setExpanded(id);
    } catch {
      setActionError("Erreur réseau");
    } finally {
      setActionBusy(null);
    }
  };

  const toggleExpand = (id: string) => setExpanded((cur) => (cur === id ? null : id));

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

      {/* Demandes particuliers */}
      <div className="mt-8 bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
        <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" /> Demandes de rapport particuliers (one-shot + captation)
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Validez la faisabilité du vol à l&apos;adresse indiquée → un email avec lien de paiement (rapport + captation 150€) est envoyé au client.
        </p>
        {actionError && <p className="text-xs text-red-400 mb-3">{actionError}</p>}
        {demandes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune demande pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-anthracite-700">
                  <th className="text-left py-2 px-2">Client</th>
                  <th className="text-left py-2 px-2">Rapport</th>
                  <th className="text-left py-2 px-2">Adresse</th>
                  <th className="text-center py-2 px-2">Statut</th>
                  <th className="text-center py-2 px-2">Date</th>
                  <th className="text-center py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map((d: Demande) => (
                  <Fragment key={d.id}>
                  <tr className="border-b border-anthracite-700/50 hover:bg-anthracite-800/50">
                    <td className="py-2.5 px-2">
                      <div className="font-medium">
                        {d.client ? `${d.client.prenom} ${d.client.nom}` : "—"}
                      </div>
                      <div className="text-xs text-gray-500">{d.email}</div>
                    </td>
                    <td className="py-2.5 px-2">{d.plan_nom}</td>
                    <td className="py-2.5 px-2">
                      <div>{d.adresse}</div>
                      <div className="text-xs text-gray-500">{d.code_postal} {d.ville}</div>
                      {d.hors_zone && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                          Hors zone
                        </span>
                      )}
                      {d.description && (
                        <div className="text-xs text-gray-400 mt-1 italic max-w-[280px] truncate" title={d.description}>
                          « {d.description} »
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${DEMANDE_STATUS[d.statut]?.cls || "bg-gray-500/10 text-gray-400"}`}>
                        {DEMANDE_STATUS[d.statut]?.label || d.statut}
                      </span>
                      {d.projet && (
                        <span className={`block mt-1 text-[10px] px-2 py-0.5 rounded-full ${PROJET_LABEL[d.projet.statut]?.cls || "bg-gray-500/10 text-gray-400"}`}>
                          {PROJET_LABEL[d.projet.statut]?.label || d.projet.statut}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center text-gray-400 text-xs">
                      {new Date(d.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {d.statut === "en_attente" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => decideDemande(d.id, "valider")}
                            disabled={actionBusy === d.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-all disabled:opacity-50"
                          >
                            {actionBusy === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Valider
                          </button>
                          <button
                            onClick={() => decideDemande(d.id, "refuser")}
                            disabled={actionBusy === d.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Refuser
                          </button>
                        </div>
                      ) : d.statut === "validee" ? (
                        <span className="text-xs text-gray-400">
                          Lien de paiement envoyé{d.stripe_session_id ? " ✓" : ""}
                        </span>
                      ) : d.statut === "payee" && !d.projet ? (
                        <div className="flex justify-center">
                          <button
                            onClick={() => createProjet(d.id)}
                            disabled={actionBusy === d.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-all disabled:opacity-50"
                          >
                            {actionBusy === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderOpen className="w-3 h-3" />}
                            Créer le projet
                          </button>
                        </div>
                      ) : d.statut === "payee" && d.projet ? (
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleExpand(d.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
                          >
                            {expanded === d.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {expanded === d.id ? "Masquer" : "Traiter"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                  {expanded === d.id && d.projet && (
                    <tr className="border-b border-anthracite-700/50 bg-anthracite-800/20">
                      <td colSpan={6} className="py-4 px-4">
                        <DemandeProjetPanel
                          projet={d.projet}
                          clientName={d.client ? `${d.client.prenom}_${d.client.nom}` : ""}
                          onRefresh={async () => {
                            const token = await getAuthToken();
                            if (token) await loadDemandes(token);
                          }}
                        />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

type CategorizedFile = { file: File; category: "NADIR" | "OBLIQUE1" | "OBLIQUE2" | "OBLIQUE3" | "OBLIQUE4" };

function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Erreur inattendue";
}

/* ─── PANEL DE TRAITEMENT D'UNE DEMANDE PAYÉE ───
 * L'admin uploade les photos du vol (comme un projet classique) puis les
 * rapports PDF d'analyse. Les photos passent par /api/admin/upload (service
 * role : le projet appartient au client) + confirm-upload. Les PDF vont sur
 * le bucket public R2 et sont stockés dans projets.rapports_pdf. */
function DemandeProjetPanel({
  projet,
  clientName,
  onRefresh,
}: {
  projet: { id: string; nom: string; statut: string; type_analyse: string; adresse: string | null; created_at: string; delivered_at: string | null; rapports_pdf?: { nom: string; url: string }[] };
  clientName: string;
  onRefresh: () => Promise<void>;
}) {
  const [files, setFiles] = useState<CategorizedFile[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [rapports, setRapports] = useState<{ nom: string; url: string }[]>(projet.rapports_pdf || []);

  const uploadPhotos = async () => {
    if (files.length === 0) { setErr("Sélectionnez au moins une photo."); return; }
    setBusy(true); setErr(""); setMsg(""); setProgress(0);
    const token = await getAuthToken();
    if (!token) return;
    try {
      const totalBytes = files.reduce((acc, cf) => acc + cf.file.size, 0);
      let uploadedBytes = 0;
      for (const cf of files) {
        // 1. URL pré-signée pour l'upload direct navigateur → R2 (contourne
        // la limite de 4,5 Mo de Vercel pour les photos DNG).
        const urlRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName,
            projectName: projet.nom,
            category: cf.category,
            filename: cf.file.name,
            contentType: cf.file.type || "application/octet-stream",
          }),
        });
        const urlJson = await urlRes.json();
        if (!urlRes.ok) throw new Error(urlJson.error || "Erreur génération URL");
        const key = urlJson.key as string;

        // 2. PUT direct sur R2 avec suivi de progression en octets.
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", urlJson.uploadUrl);
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setProgress(Math.round(((uploadedBytes + ev.loaded) / totalBytes) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload R2 échoué (${xhr.status})`));
          };
          xhr.onerror = () => reject(new Error("Erreur réseau upload R2"));
          xhr.send(cf.file);
        });
        uploadedBytes += cf.file.size;

        // 3. Copie serveur privé → public + mise à jour du projet.
        const finalize = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            projetId: projet.id,
            category: cf.category,
            filename: urlJson.filename,
            clientName,
            projectName: projet.nom,
            key,
          }),
        });
        const finalizeJson = await finalize.json();
        if (!finalize.ok) throw new Error(finalizeJson.error || "Erreur finalisation");
      }
      const confirm = await fetch("/api/confirm-upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ projetId: projet.id, clientName, projectName: projet.nom }),
      });
      if (!confirm.ok) throw new Error("Erreur confirmation upload");
      setMsg("Photos envoyées — le projet est en cours de traitement.");
      setFiles([]);
      await onRefresh();
    } catch (e: unknown) {
      setErr(errMessage(e) || "Erreur upload");
    } finally {
      setBusy(false);
    }
  };

  const uploadRapport = async (file: File) => {
    const token = await getAuthToken();
    if (!token) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projetId", projet.id);
    formData.append("clientName", clientName);
    formData.append("projectName", projet.nom);
    const res = await fetch("/api/admin/rapports", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Erreur upload rapport");
    setRapports(json.rapports || []);
  };

  const uploadPdfs = async () => {
    if (pdfFiles.length === 0) { setErr("Sélectionnez au moins un fichier PDF."); return; }
    setBusy(true); setErr(""); setMsg("");
    try {
      for (const f of pdfFiles) await uploadRapport(f);
      setMsg("Rapport(s) PDF ajouté(s).");
      setPdfFiles([]);
      await onRefresh();
    } catch (e: unknown) {
      setErr(errMessage(e) || "Erreur upload rapport");
    } finally {
      setBusy(false);
    }
  };

  const removeRapport = async (nom: string) => {
    const token = await getAuthToken();
    if (!token) return;
    setErr("");
    try {
      const res = await fetch("/api/admin/rapports", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ projetId: projet.id, nom }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur suppression");
      setRapports(json.rapports || []);
      await onRefresh();
    } catch (e: unknown) {
      setErr(errMessage(e) || "Erreur suppression rapport");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="font-medium text-sm">{projet.nom}</p>
            <p className="text-xs text-gray-500">
              Projet créé le {new Date(projet.created_at).toLocaleDateString("fr-FR")}
              {projet.adresse && ` — ${projet.adresse}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full ${PROJET_LABEL[projet.statut]?.cls || "bg-gray-500/10 text-gray-400"}`}>
            {PROJET_LABEL[projet.statut]?.label || projet.statut}
          </span>
          {projet.statut === "livre" && (
            <a
              href={`/dashboard/projets/${projet.id}`}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
            >
              Voir la page du projet <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {projet.statut !== "livre" && (
        <div className="p-4 bg-anthracite-800/40 border border-anthracite-700 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-cyan-400" /> Photos du vol (comme un projet classique)
            </p>
            {msg && <p className="text-xs text-green-400">{msg}</p>}
            {err && <p className="text-xs text-red-400">{err}</p>}
          </div>
          <UploadZone files={files} onFilesChange={setFiles} />
          <div className="flex justify-end">
            <button
              onClick={uploadPhotos}
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
            >
              {busy ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {progress > 0 ? `Envoi… ${progress}%` : "Préparation…"}</>
              ) : (
                <><Upload className="w-4 h-4" /> Envoyer les photos & lancer le traitement</>
              )}
            </button>
          </div>
          {busy && (
            <div className="w-full h-1.5 bg-anthracite-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-anthracite-800/40 border border-anthracite-700 rounded-xl space-y-3">
        <p className="text-sm font-medium flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" /> Rapports PDF d&apos;analyse à livrer au client
        </p>
        <div className="flex flex-wrap gap-2">
          {rapports.length === 0 ? (
            <p className="text-xs text-gray-500">Aucun rapport PDF ajouté.</p>
          ) : (
            rapports.map((r) => (
              <div key={r.nom} className="flex items-center gap-2 px-3 py-1.5 bg-anthracite-800 border border-anthracite-600 rounded-lg text-xs">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-cyan-400 truncate max-w-[240px]">
                  {r.nom}
                </a>
                <button onClick={() => removeRapport(r.nom)} className="text-gray-500 hover:text-red-400 transition-colors" aria-label="Supprimer">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) => setPdfFiles(Array.from(e.target.files || []))}
            className="text-xs text-gray-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-anthracite-600 file:bg-anthracite-800 file:text-cyan-400 file:text-xs file:cursor-pointer"
          />
          <button
            onClick={uploadPdfs}
            disabled={busy || pdfFiles.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Ajouter le(s) rapport(s)
          </button>
        </div>
        {pdfFiles.length > 0 && (
          <p className="text-xs text-gray-500">{pdfFiles.length} fichier(s) sélectionné(s) : {pdfFiles.map((f) => f.name).join(", ")}</p>
        )}
      </div>
    </div>
  );
}
