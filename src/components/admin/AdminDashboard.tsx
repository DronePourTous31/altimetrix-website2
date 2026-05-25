"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, FileText, CheckCircle, Clock, AlertCircle, Euro, Search, ArrowUpDown } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface Stats {
  en_attente: number;
  en_traitement: number;
  livre: number;
  erreur: number;
  clients: number;
  mrr: number;
}

interface ProjetRow {
  id: string;
  nom: string;
  adresse: string | null;
  type_analyse: string;
  statut: string;
  created_at: string;
  profiles: { prenom: string; nom: string } | null;
}

interface ClientRow {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  forfait_id: string | null;
  abonnement_actif: boolean;
  created_at: string;
  projets_count: number;
}

const COLORS = ["#00BCD4", "#FF6B35", "#10B981", "#F59E0B", "#7C3AED", "#EF4444"];

function getBadgeStatus(s: string): "actif" | "en_cours" | "livre" | "erreur" {
  const map: Record<string, "actif" | "en_cours" | "livre" | "erreur"> = {
    upload_en_attente: "actif", en_traitement: "en_cours", livre: "livre", erreur: "erreur",
  };
  return map[s] || "actif";
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"projets" | "clients" | "stats">("projets");
  const [projets, setProjets] = useState<ProjetRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [stats, setStats] = useState<Stats>({ en_attente: 0, en_traitement: 0, livre: 0, erreur: 0, clients: 0, mrr: 0 });
  const [filterStatut, setFilterStatut] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [barData, setBarData] = useState<{ mois: string; projets: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [editProjetId, setEditProjetId] = useState<string | null>(null);
  const [editViewerUrl, setEditViewerUrl] = useState("");
  const [editRapportUrl, setEditRapportUrl] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/data");
    const data = await res.json();
    if (data.error) return;
    setStats(data.stats);
    setProjets(data.projets);
    setClients(data.clients);
    setBarData(data.barData || []);
    setPieData(data.pieData || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateProjetStatut = async (projetId: string, statut: string) => {
    const res = await fetch("/api/admin/update-projet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projet_id: projetId, statut, viewer_url: editViewerUrl || null, rapport_url: editRapportUrl || null }),
    });
    const data = await res.json();
    setActionMsg(data.success ? "Projet mis à jour" : "Erreur");
    setEditProjetId(null);
    fetchData();
    setTimeout(() => setActionMsg(""), 3000);
  };

  const filteredProjets = filterStatut ? projets.filter((p) => p.statut === filterStatut) : projets;
  const filteredClients = searchClient
    ? clients.filter((c) => `${c.prenom} ${c.nom} ${c.email}`.toLowerCase().includes(searchClient.toLowerCase()))
    : clients;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-dark-800 font-heading">Administration</h1>
        {actionMsg && <span className="text-sm text-green-600 font-medium">{actionMsg}</span>}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {[
          { icon: AlertCircle, label: "En attente", value: stats.en_attente, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: Clock, label: "En traitement", value: stats.en_traitement, color: "text-primary-600", bg: "bg-primary-50" },
          { icon: CheckCircle, label: "Livrés", value: stats.livre, color: "text-green-600", bg: "bg-green-50" },
          { icon: FileText, label: "Erreur", value: stats.erreur, color: "text-red-600", bg: "bg-red-50" },
          { icon: Users, label: "Clients", value: stats.clients, color: "text-purple-600", bg: "bg-purple-50" },
          { icon: Euro, label: "MRR", value: `${stats.mrr}€`, color: "text-dark-800", bg: "bg-dark-50" },
        ].map((k) => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4 border border-transparent`}>
            <k.icon className={`w-5 h-5 ${k.color} mb-2`} />
            <p className="text-2xl font-bold text-dark-800">{k.value}</p>
            <p className="text-xs text-dark-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex gap-1 mb-6 bg-dark-100 rounded-xl p-1 w-fit">
        {["projets", "clients", "stats"].map((t) => (
          <button key={t} onClick={() => setTab(t as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? "bg-white text-dark-800 shadow-sm" : "text-dark-500 hover:text-dark-700"}`}
          >{{ projets: "Projets", clients: "Clients", stats: "Statistiques" }[t]}</button>
        ))}
      </div>

      {/* TAB PROJETS */}
      {tab === "projets" && (
        <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
          <div className="p-4 border-b border-dark-100 flex flex-wrap gap-2">
            {["", "upload_en_attente", "en_traitement", "livre", "erreur"].map((s) => (
              <button key={s} onClick={() => setFilterStatut(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatut === s ? "bg-dark-800 text-white" : "bg-dark-100 text-dark-600 hover:bg-dark-200"}`}
              >{s ? { upload_en_attente: "En attente", en_traitement: "Traitement", livre: "Livré", erreur: "Erreur" }[s] : "Tous"}</button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-50 text-dark-500 text-xs uppercase">
                <tr><th className="text-left px-4 py-3">Projet</th><th className="text-left px-4 py-3">Client</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Statut</th><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {filteredProjets.map((p) => (
                  <tr key={p.id} className="hover:bg-dark-50">
                    <td className="px-4 py-3 font-medium text-dark-800">{p.nom}</td>
                    <td className="px-4 py-3 text-dark-500">{p.profiles ? `${p.profiles.prenom} ${p.profiles.nom}` : "—"}</td>
                    <td className="px-4 py-3 text-dark-500 capitalize">{p.type_analyse}</td>
                    <td className="px-4 py-3"><Badge status={getBadgeStatus(p.statut)} /></td>
                    <td className="px-4 py-3 text-dark-400 text-xs">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className="px-4 py-3">
                      {editProjetId === p.id ? (
                        <div className="flex flex-col gap-1.5">
                          <input value={editViewerUrl} onChange={(e) => setEditViewerUrl(e.target.value)} placeholder="URL viewer 3D" className="w-36 px-2 py-1 border rounded text-xs" />
                          <input value={editRapportUrl} onChange={(e) => setEditRapportUrl(e.target.value)} placeholder="URL rapport PDF" className="w-36 px-2 py-1 border rounded text-xs" />
                          <div className="flex gap-1">
                            <button onClick={() => updateProjetStatut(p.id, "en_traitement")} className="px-2 py-1 bg-primary-600 text-white rounded text-xs">Traitement</button>
                            <button onClick={() => updateProjetStatut(p.id, "livre")} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Livré</button>
                            <button onClick={() => { setEditProjetId(null); updateProjetStatut(p.id, "erreur"); }} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Erreur</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setEditProjetId(p.id); setEditViewerUrl(""); setEditRapportUrl(""); }} className="text-primary-600 hover:underline text-xs">Modifier</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CLIENTS */}
      {tab === "clients" && (
        <div className="bg-white rounded-xl border border-dark-100 overflow-hidden">
          <div className="p-4 border-b border-dark-100">
            <div className="flex items-center gap-2 bg-dark-50 rounded-lg px-3 py-2 max-w-sm">
              <Search className="w-4 h-4 text-dark-400" />
              <input value={searchClient} onChange={(e) => setSearchClient(e.target.value)} placeholder="Rechercher un client..." className="flex-1 text-sm bg-transparent outline-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-50 text-dark-500 text-xs uppercase">
                <tr><th className="text-left px-4 py-3">Nom</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Forfait</th><th className="text-left px-4 py-3">Projets/mois</th><th className="text-left px-4 py-3">Inscription</th></tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-dark-50">
                    <td className="px-4 py-3 font-medium text-dark-800">{c.prenom} {c.nom}</td>
                    <td className="px-4 py-3 text-dark-500 text-xs">{c.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.abonnement_actif ? "bg-green-50 text-green-700" : "bg-dark-100 text-dark-500"}`}>
                        {c.abonnement_actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-dark-500">{c.projets_count}</td>
                    <td className="px-4 py-3 text-dark-400 text-xs">{new Date(c.created_at).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB STATS */}
      {tab === "stats" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-dark-100 p-6">
            <h3 className="font-semibold text-dark-800 mb-4">Projets par mois</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="projets" fill="#00BCD4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-dark-100 p-6">
            <h3 className="font-semibold text-dark-800 mb-4">Répartition par analyse</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}               label={(entry: { name?: string; percent?: number }) => `${entry.name || ""} ${((entry.percent || 0) * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
