"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, CreditCard, Loader2, ExternalLink, History, Receipt, MapPin, ArrowRight } from "lucide-react";
import { getAuthToken } from "@/lib/supabase/client";

interface ForfaitQuota {
  forfait: { id: string; nom?: string | null; prix_mensuel?: number | null; nb_projets_mois?: number | null } | null;
  planId: string | null;
  quota: number;
  used: number;
  remaining: number;
  count: number;
  anchor: string;
}

// Nom + prix affichés selon le planId résolu : un « Starter Mesures » avec
// l'option Calepinage 3D mensuelle est un « Starter Mesures+ » (59€/mois).
const PLAN_DISPLAY: Record<string, { nom: string; prixMensuel: number }> = {
  "starter-mesures": { nom: "Starter Mesures", prixMensuel: 4900 },
  "starter-mesures-plus": { nom: "Starter Mesures+", prixMensuel: 5900 },
  "starter-pro": { nom: "Starter Pro", prixMensuel: 11900 },
  "solar-pro": { nom: "Solar Pro", prixMensuel: 7900 },
  "solar-pro-plus": { nom: "Solar Pro+", prixMensuel: 18900 },
};

function planLabel(f: ForfaitQuota): { nom: string; prixMensuel: number | null } {
  if (f.planId && PLAN_DISPLAY[f.planId]) return PLAN_DISPLAY[f.planId];
  return {
    nom: f.forfait?.nom || "Forfait",
    prixMensuel: f.forfait?.prix_mensuel ?? null,
  };
}

interface Profile {
  prenom?: string | null;
  nom?: string | null;
  email?: string | null;
  type_compte?: string | null;
  siret?: string | null;
  created_at?: string;
  abonnement_actif?: boolean;
  plan_id?: string | null;
  essais_gratuits_restants?: number | null;
  projets_restants?: number | null;
  forfaits?: ForfaitQuota[];
  abonnements?: AbonnementInfo[];
}

interface AbonnementInfo {
  id: string;
  forfait_id: string;
  plan_id: string | null;
  calepinage: boolean;
  stripe_subscription_id: string | null;
  created_at: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  interval: string | null;
}

interface Commande {
  id: string;
  created_at: string;
  montant: number;
  statut: string;
  type: "forfait" | "achat";
  libelle: string;
}

interface DemandeParticulier {
  id: string;
  plan_nom: string;
  adresse: string;
  code_postal: string;
  ville: string;
  hors_zone: boolean;
  description: string | null;
  statut: "en_attente" | "validee" | "refusee" | "payee";
  paiement_url: string | null;
  created_at: string;
  projet: {
    id: string;
    nom: string;
    statut: string;
    type_analyse: string;
    created_at: string;
    delivered_at: string | null;
  } | null;
}

const DEMANDE_LABEL: Record<string, string> = {
  en_attente: "En attente de validation",
  validee: "Faisabilité validée — paiement en attente",
  refusee: "Refusée",
  payee: "Payée",
};

const PROJET_LABEL: Record<string, string> = {
  upload_en_attente: "Captation en attente",
  en_traitement: "En traitement",
  livre: "Rapport livré",
  erreur: "Erreur",
};

const eur = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format((cents || 0) / 100);

const MOIS_LABEL: Record<string, string> = {
  "01": "janvier", "02": "février", "03": "mars", "04": "avril",
  "05": "mai", "06": "juin", "07": "juillet", "08": "août",
  "09": "septembre", "10": "octobre", "11": "novembre", "12": "décembre",
};

export default function MonComptePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [demandes, setDemandes] = useState<DemandeParticulier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuthToken().then(async (token) => {
      if (!token) return router.push("/auth/login");
      const headers = { Authorization: `Bearer ${token}` };
      const [meRes, cmdRes, demRes] = await Promise.all([
        fetch("/api/me", { headers }),
        fetch("/api/commandes", { headers }),
        fetch("/api/demandes-particuliers", { headers }),
      ]);
      if (meRes.ok) setProfile((await meRes.json()) as Profile);
      if (cmdRes.ok) {
        const data = (await cmdRes.json()) as Commande[];
        setCommandes(Array.isArray(data) ? data : []);
      }
      if (demRes.ok) {
        const data = await demRes.json();
        setDemandes(Array.isArray(data?.demandes) ? data.demandes : []);
      }
      setLoading(false);
    });
  }, [router]);

  // Synthèse : nb + total des achats / forfaits par mois, puis global
  const summary = useMemo(() => {
    const byMonth = new Map<string, { nbAchats: number; totalAchats: number; nbForfaits: number; totalForfaits: number }>();
    for (const c of commandes) {
      if (c.statut !== "payee") continue;
      const d = new Date(c.created_at);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const g = byMonth.get(key) ?? { nbAchats: 0, totalAchats: 0, nbForfaits: 0, totalForfaits: 0 };
      if (c.type === "achat") {
        g.nbAchats += 1;
        g.totalAchats += c.montant || 0;
      } else {
        g.nbForfaits += 1;
        g.totalForfaits += c.montant || 0;
      }
      byMonth.set(key, g);
    }
    const rows = [...byMonth.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, g]) => {
        const [, mm] = key.split("-");
        const label = `${MOIS_LABEL[mm] ?? mm} ${key.slice(0, 4)}`;
        return { label, ...g, total: g.totalAchats + g.totalForfaits };
      });
    const global = rows.reduce(
      (acc, r) => ({
        nbAchats: acc.nbAchats + r.nbAchats,
        totalAchats: acc.totalAchats + r.totalAchats,
        nbForfaits: acc.nbForfaits + r.nbForfaits,
        totalForfaits: acc.totalForfaits + r.totalForfaits,
        total: acc.total + r.total,
      }),
      { nbAchats: 0, totalAchats: 0, nbForfaits: 0, totalForfaits: 0, total: 0 }
    );
    return { rows, global };
  }, [commandes]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );

  const forfaits = profile?.forfaits ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Mon compte</h1>
      <div className="space-y-6">
        {/* Informations personnelles */}
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" /> Informations personnelles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Prénom</p>
              <p className="font-medium mt-0.5">{profile?.prenom || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Nom</p>
              <p className="font-medium mt-0.5">{profile?.nom || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="font-medium mt-0.5">{profile?.email || "-"}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Type de compte</p>
              <p className="font-medium mt-0.5 capitalize">
                {profile?.type_compte === "artisan" ? "Artisan / Pro" : "Particulier"}
              </p>
            </div>
            {profile?.siret && (
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-xs">SIRET</p>
                <p className="font-medium mt-0.5">{profile.siret}</p>
              </div>
            )}
            <div>
              <p className="text-gray-500 text-xs">Membre depuis</p>
              <p className="font-medium mt-0.5">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("fr-FR")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Forfaits actifs */}
        <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" /> {forfaits.length > 1 ? "Forfaits actifs" : "Abonnement"}
            </h2>
            <div className="flex gap-2">
              {profile?.abonnement_actif && (
                <button
                  onClick={async () => {
                    const token = await getAuthToken();
                    if (!token) return;
                    const res = await fetch("/api/portal", {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-anthracite-700 text-gray-300 rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Gérer
                </button>
              )}
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm border border-anthracite-700 text-gray-300 rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
              >
                {profile?.abonnement_actif ? "Changer" : "Souscrire"}
              </Link>
            </div>
          </div>

          {forfaits.length > 0 ? (
            <div className="space-y-3">
              {forfaits.map((f) => {
                const { nom, prixMensuel } = planLabel(f);
                const abo = (profile?.abonnements ?? []).find((a) => a.plan_id === f.planId);
                const intervalLabel =
                  abo?.interval === "year" ? "an" : abo?.interval === "month" ? "mois" : null;
                return (
                  <div key={f.forfait?.id ?? f.planId ?? f.anchor} className="flex items-center justify-between p-4 bg-anthracite-800 rounded-xl border border-anthracite-700">
                    <div>
                      <p className="font-medium">
                        {nom}
                        {f.count > 1 ? <span className="text-gray-500"> ×{f.count}</span> : null}
                      </p>
                      <p className="text-sm text-gray-500">
                        {prixMensuel != null ? `${prixMensuel / 100} €/${intervalLabel ?? "mois"}` : "—"}
                      </p>
                      <p className="text-sm text-cyan-400 mt-1">
                        {f.remaining} projet{f.remaining !== 1 ? "s" : ""} restant{f.remaining !== 1 ? "s" : ""} ce mois
                        <span className="text-gray-500"> (sur {f.quota})</span>
                      </p>
                      {f.anchor && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          Activé le {new Date(f.anchor).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      {abo?.cancel_at_period_end && abo.current_period_end && (
                        <p className="text-xs text-amber-400 mt-0.5">
                          Résiliation programmée — actif jusqu&apos;au {new Date(abo.current_period_end).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                    {abo && !abo.cancel_at_period_end && abo.stripe_subscription_id && (
                      <button
                        onClick={async () => {
                          const token = await getAuthToken();
                          if (!token) return;
                          const finPeriode = abo.current_period_end
                            ? new Date(abo.current_period_end).toLocaleDateString("fr-FR")
                            : null;
                          if (
                            !confirm(
                              `Résilier « ${nom} » ?\n\n` +
                                (finPeriode
                                  ? `L'abonnement restera actif jusqu'au ${finPeriode} puis ne sera plus renouvelé.`
                                  : `L'abonnement restera actif jusqu'à la fin de la période en cours puis ne sera plus renouvelé.`)
                            )
                          ) return;
                          const res = await fetch(`/api/abonnements/${abo.id}`, {
                            method: "PATCH",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.ok) {
                            router.refresh();
                            setProfile((p) =>
                              p
                                ? {
                                    ...p,
                                    abonnements: (p.abonnements ?? []).map((a) =>
                                      a.id === abo.id ? { ...a, cancel_at_period_end: true } : a
                                    ),
                                  }
                                : p
                            );
                          } else {
                            alert("Impossible de résilier l'abonnement. Réessayez.");
                          }
                        }}
                        className="shrink-0 px-3 py-1.5 text-xs border border-anthracite-600 text-gray-400 rounded-lg hover:border-red-500/50 hover:text-red-400 transition-all"
                      >
                        Résilier
                      </button>
                    )}
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-4 bg-anthracite-800/60 rounded-xl border border-anthracite-700">
                <p className="text-sm font-medium">Total de projets restants ce mois</p>
                <p className="text-lg font-semibold text-cyan-400">
                  {profile?.projets_restants ?? 0}
                </p>
              </div>
            </div>
          ) : profile?.abonnement_actif ? (
            <p className="text-sm text-cyan-400 mt-1">Abonnement actif</p>
          ) : (
            <div className="flex items-center justify-between p-4 bg-anthracite-800 rounded-xl border border-anthracite-700">
              <div>
                <p className="font-medium">
                  {profile?.plan_id === "solar-pro" ? "Essai Solar Pro" : "Essai gratuit"}
                </p>
                <p className="text-sm text-gray-500">
                  {profile?.essais_gratuits_restants || 0} projet(s) offert(s) restant(s)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Historique des commandes */}
        {commandes.length > 0 && (
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" /> Historique des commandes
            </h2>
            <div className="space-y-2">
              {commandes.map((cmd) => (
                <div
                  key={cmd.id}
                  className="flex items-center justify-between gap-3 p-3 bg-anthracite-800 rounded-xl border border-anthracite-700 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{cmd.libelle}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(cmd.created_at).toLocaleDateString("fr-FR")} · {eur(cmd.montant)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        cmd.type === "forfait"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {cmd.type === "forfait" ? "Forfait" : "Achat"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        cmd.statut === "payee"
                          ? "bg-green-500/10 text-green-400"
                          : cmd.statut === "echec"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {cmd.statut === "payee"
                        ? "Payée"
                        : cmd.statut === "echec"
                          ? "Échec"
                          : "En attente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demandes de rapport particuliers */}
        {demandes.length > 0 && (
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Mes demandes de rapport
            </h2>
            <div className="space-y-2">
              {demandes.map((d) => (
                <div
                  key={d.id}
                  className="p-4 bg-anthracite-800 rounded-xl border border-anthracite-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{d.plan_nom}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {d.adresse}, {d.code_postal} {d.ville}
                        {d.hors_zone && <span className="text-amber-400"> · hors périmètre standard</span>}
                      </p>
                      {d.description && (
                        <p className="text-xs text-gray-400 mt-1 italic">« {d.description} »</p>
                      )}
                      <p className="text-xs text-gray-600 mt-0.5">
                        Demande du {new Date(d.created_at).toLocaleDateString("fr-FR")}
                      </p>
                      {d.projet && (
                        <div className="mt-2">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${
                            d.projet.statut === "livre"
                              ? "bg-green-500/10 text-green-400"
                              : d.projet.statut === "en_traitement"
                                ? "bg-amber-500/10 text-amber-400"
                                : d.projet.statut === "erreur"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-cyan-500/10 text-cyan-400"
                          }`}>
                            {PROJET_LABEL[d.projet.statut] || d.projet.statut}
                          </span>
                          {d.projet.statut === "livre" && (
                            <Link
                              href={`/dashboard/projets/${d.projet.id}`}
                              className="ml-2 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                            >
                              Accéder à mon rapport <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-xs px-2.5 py-1 rounded-full ${
                        d.statut === "payee"
                          ? "bg-green-500/10 text-green-400"
                          : d.statut === "validee"
                            ? "bg-cyan-500/10 text-cyan-400"
                            : d.statut === "refusee"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {DEMANDE_LABEL[d.statut] || d.statut}
                    </span>
                  </div>
                  {d.statut === "validee" && d.paiement_url && (
                    <div className="mt-3 pt-3 border-t border-anthracite-700 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs text-gray-400">
                        La faisabilité du vol est confirmée. Réglez votre rapport pour lancer la captation.
                      </p>
                      <a
                        href={d.paiement_url}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl gradient-cyan text-white hover:opacity-90 transition-all shrink-0"
                      >
                        Payer <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synthèse */}
        {summary.rows.length > 0 && (
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-cyan-400" /> Synthèse des paiements
            </h2>
            <div className="overflow-x-auto rounded-xl border border-anthracite-700/70">
              <table className="w-full text-sm text-center border-separate border-spacing-0 [&_td]:py-2.5 [&_th]:py-2.5 [&_td]:px-3 [&_th]:px-3 [&_tr:last-child_td]:border-b-0">
                <thead>
                  <tr className="text-xs text-gray-400 bg-anthracite-800/60">
                    <th className="text-left font-semibold border-b border-r border-anthracite-700/70">Période</th>
                    <th className="font-semibold border-b border-r border-anthracite-700/70">Achats</th>
                    <th className="font-semibold border-b border-r border-anthracite-700/70">Total achats</th>
                    <th className="font-semibold border-b border-r border-anthracite-700/70">Forfaits</th>
                    <th className="font-semibold border-b border-r border-anthracite-700/70">Total forfaits</th>
                    <th className="font-semibold border-b border-anthracite-700/70">Cumul</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.rows.map((r) => (
                    <tr key={r.label} className="border-anthracite-700/70">
                      <td className="text-left font-medium border-b border-r border-anthracite-700/70 capitalize">{r.label}</td>
                      <td className="border-b border-r border-anthracite-700/70">{r.nbAchats}</td>
                      <td className="border-b border-r border-anthracite-700/70">{r.totalAchats > 0 ? eur(r.totalAchats) : "—"}</td>
                      <td className="border-b border-r border-anthracite-700/70">{r.nbForfaits}</td>
                      <td className="border-b border-r border-anthracite-700/70">{r.totalForfaits > 0 ? eur(r.totalForfaits) : "—"}</td>
                      <td className="border-b border-anthracite-700/70 font-medium">{eur(r.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-anthracite-800/60">
                    <td className="text-left font-semibold border-r border-anthracite-700/70">Total global</td>
                    <td className="border-r border-anthracite-700/70 font-medium">{summary.global.nbAchats}</td>
                    <td className="border-r border-anthracite-700/70 font-medium">{eur(summary.global.totalAchats)}</td>
                    <td className="border-r border-anthracite-700/70 font-medium">{summary.global.nbForfaits}</td>
                    <td className="border-r border-anthracite-700/70 font-medium">{eur(summary.global.totalForfaits)}</td>
                    <td className="font-bold text-cyan-400">{eur(summary.global.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
              Achats = projets à la carte et options payantes. Forfaits = abonnements (incl. renouvellements mensuels).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
