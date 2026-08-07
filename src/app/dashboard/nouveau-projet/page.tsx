"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UploadZone from "@/components/projects/UploadZone";
import { ArrowLeft, ArrowRight, Check, Ruler, Sun, Loader2, AlertCircle, Lock } from "lucide-react";
import { resolvePlanId, typeAllowedForPlan, calepinagePayantForPlans, EXTRA_PROJET_PRICES_CENTS } from "@/lib/plans";
import type { TypeAnalyse } from "@/lib/types";

type Step = 1 | 2 | 3;
type CategoryType = "NADIR" | "OBLIQUE1" | "OBLIQUE2" | "OBLIQUE3" | "OBLIQUE4";

interface CategorizedFile {
  file: File;
  category: CategoryType;
}

interface PlanInfo {
  abonnementActif: boolean;
  forfaitSlug: string | null;
  calepinageActif: boolean;
  planId: string | null;
  activePlanIds: string[];
  aUnEssai: boolean;
}

const OPTION_INSPECTION_PRICE = 5;
const OPTION_CALEPINAGE_PRICE = 10;

const analyseOptions: { value: TypeAnalyse; label: string; desc: string; icon: React.ElementType }[] = [
  {
    value: "mesure",
    label: "Métrés & mesures",
    desc: "Modèle 3D, DSM, outils de mesure",
    icon: Ruler,
  },
  {
    value: "calepinage",
    label: "Calepinage 3D",
    desc: "Inclut tout « Métrés & mesures » + calepinage panneaux solaires en 3D",
    icon: Ruler,
  },
  {
    value: "solaire",
    label: "Analyse solaire + calepinage",
    desc: "Inclut tout « Calepinage 3D » + irradiation, ombrage, production estimée",
    icon: Sun,
  },
];

const MATRIX_COLUMNS: { id: string; label: string }[] = [
  { id: "starter-mesures", label: "Starter Mesures" },
  { id: "starter-mesures-plus", label: "Starter Mesures+" },
  { id: "starter-pro", label: "Starter Pro" },
  { id: "solar-pro", label: "Solar Pro" },
  { id: "solar-pro-plus", label: "Solar Pro+" },
  { id: "particulier-standard", label: "Rapport Standard" },
  { id: "particulier-premium", label: "Rapport Premium" },
];

const MATRIX_ROWS: { type: string; label: string }[] = [
  { type: "mesure", label: "Métrés & mesures" },
  { type: "calepinage", label: "Calepinage 3D" },
  { type: "solaire", label: "Analyse solaire + calepinage" },
  { type: "photos", label: "Photos pour inspection" },
  { type: "extra", label: "Projet supplémentaire" },
];

export default function NouveauProjetPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const [nom, setNom] = useState("");
  const [typeAnalyse, setTypeAnalyse] = useState<TypeAnalyse>("mesure");
  const [adresse, setAdresse] = useState("");

  const [files, setFiles] = useState<CategorizedFile[]>([]);

  const [inspectionPhotos, setInspectionPhotos] = useState(false);
  const [calepinageOption, setCalepinageOption] = useState(false);
  const [plan, setPlan] = useState<PlanInfo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;
        const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (!res.ok) return;
        const me = await res.json();
        const forfaitSlug = me.forfait?.slug ?? null;
        const planId = resolvePlanId({ plan_id: me.plan_id ?? null, forfait_slug: forfaitSlug });
        const abonnementActif = !!me.abonnement_actif;
        const aUnEssai = (me.essais_gratuits_restants ?? 0) > 0;
        // Tous les forfaits actifs (multi-abonnements) → surlignage de la
        // matrice. L'essai (Solar Pro) compte aussi comme forfait couvrant.
        const activePlanIds = [
          ...new Set<string>(
            [...(me.forfaits ?? []).map((f: { planId?: string | null }) => f.planId ?? "").filter(Boolean),
            ...(planId && (abonnementActif || aUnEssai) ? [planId] : [])]
          ),
        ];
        setPlan({
          abonnementActif,
          forfaitSlug,
          calepinageActif: !!me.calepinage_actif,
          planId,
          activePlanIds,
          aUnEssai,
        });
        // « Métrés & mesures » seul devient redondant (calepinage inclus) →
        // basculer la sélection par défaut vers « Calepinage 3D ».
        const calepinagePayant_ = calepinagePayantForPlans(activePlanIds, !!me.calepinage_actif);
        const calepinageInclus_ =
          aUnEssai ||
          !!me.calepinage_actif ||
          activePlanIds.some((pid: string) => pid && typeAllowedForPlan("calepinage", pid) && !calepinagePayant_);
        if (!aUnEssai && calepinageInclus_ && typeAnalyse === "mesure") {
          setTypeAnalyse("calepinage");
        }
      } catch {}
    })();
  }, []);

  const calepinagePayant = calepinagePayantForPlans(plan?.activePlanIds ?? [], !!plan?.calepinageActif);

  // Analyses recommandées selon les forfaits actifs : « Calepinage 3D » et
  // « Analyse solaire + calepinage » sont les analyses complètes. « Métrés &
  // mesures » seul est redondant dès que le calepinage est inclus dans un
  // forfait actif (Starter Mesures+, Starter Pro, Solar Pro…) : on le bloque
  // pour ne pas gaspiller un créneau sur une analyse incomplète.
  const hasSolaire = !!plan?.aUnEssai || (plan?.activePlanIds ?? []).some((pid) => pid && typeAllowedForPlan("solaire", pid));
  const calepinageInclus =
    !!plan?.aUnEssai ||
    !!plan?.calepinageActif ||
    (plan?.activePlanIds ?? []).some((pid) => pid && typeAllowedForPlan("calepinage", pid) && !calepinagePayant);
  const recommendedTypes: TypeAnalyse[] = hasSolaire
    ? ["calepinage", "solaire"]
    : calepinageInclus
      ? ["calepinage"]
      : ["mesure"];
  const mesureRedondante = calepinageInclus && !plan?.aUnEssai;

  const isTypeEnabled = (t: TypeAnalyse) => {
    if (!plan) return true;
    if (plan.aUnEssai) return true;
    if (t === "mesure" && mesureRedondante) return false;
    return plan.activePlanIds.some((pid) => pid && typeAllowedForPlan(t, pid));
  };

  const canGoNext = () => {
    if (step === 1) return nom.trim().length > 0;
    if (step === 2) return files.length >= 20;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Lecture du token directement depuis document.cookie
    const cookies = document.cookie.split("; ").reduce<Record<string, string>>((acc, c) => {
      const [k, ...v] = c.split("=");
      acc[k] = v.join("=");
      return acc;
    }, {});
    const sbCookieName = Object.keys(cookies).find(k => k.includes("-auth-token"));
    let token = "";
    if (sbCookieName) {
      try { token = JSON.parse(atob(cookies[sbCookieName]))?.access_token || ""; } catch {}
    }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    } else if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch("/api/create-projet", {
      method: "POST",
      headers,
      body: JSON.stringify({
        nom,
        adresse,
        typeAnalyse,
        inspectionPhotos,
        optionCalepinage: calepinagePayant && (typeAnalyse === "calepinage" || calepinageOption),
      }),
    });

    if (!res.ok) {
      if (res.status === 401) { router.push("/auth/login"); return; }
      let msg = "Erreur lors de la création du projet. Réessayez.";
      try {
        const err = await res.json();
        if (err?.error) msg = err.error;
        if (err?.redirect) { router.push(err.redirect); return; }
      } catch {}
      setError(msg);
      setLoading(false);
      return;
    }

    const { projet, profile } = await res.json();

    setUploading(true);
    let uploaded = 0;
    for (const cf of files) {
      try {
        const formData = new FormData();
        formData.append("file", cf.file);
        formData.append("projetId", projet.id);
        formData.append("category", cf.category);
        formData.append("clientName", `${profile?.prenom || ""}_${profile?.nom || ""}`);
        formData.append("projectName", nom);

        const uploadHeaders: Record<string, string> = {};
        if (session?.access_token) {
          uploadHeaders["Authorization"] = `Bearer ${session.access_token}`;
        }
        await fetch("/api/upload", {
          method: "POST",
          headers: uploadHeaders,
          body: formData,
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
      uploaded++;
      setUploadProgress(Math.round((uploaded / files.length) * 100));
    }
    setUploading(false);

    // Marquer l'upload comme terminé : le watcher attend ce flag + options_payees
    // avant de lancer le traitement (ne plus démarrer dès la première photo).
    try {
      await fetch("/api/confirm-upload", {
        method: "POST",
        headers,
        body: JSON.stringify({
          projetId: projet.id,
          clientName: `${profile?.prenom || ""}_${profile?.nom || ""}`,
          projectName: nom,
        }),
      });
    } catch (err) {
      console.error("confirm-upload error:", err);
    }

    const { redirect } = await fetch("/api/finaliser-projet", {
      method: "POST",
      headers,
      body: JSON.stringify({ projetId: projet.id }),
    }).then(r => r.json());

    window.location.href = redirect;
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? "bg-cyan-500 text-white" : "bg-anthracite-700 text-gray-500"
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`text-xs hidden sm:block ${step >= s ? "text-white font-medium" : "text-gray-500"}`}>
              {s === 1 ? "Infos" : s === 2 ? "Photos" : "Confirmation"}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-cyan-500" : "bg-anthracite-700"}`} />}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold mb-8">Nouveau projet</h1>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom du projet *</label>
              <input value={nom} onChange={(e) => setNom(e.target.value)}
                className="w-full px-4 py-2.5 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="Ex: Toiture M. Dupont - Lyon 2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Type d&apos;analyse</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {analyseOptions.map((opt) => {
                  const enabled = isTypeEnabled(opt.value);
                  const selected = typeAnalyse === opt.value;
                  const showAddon = opt.value === "calepinage" && calepinagePayant;
                  const recommended = plan && recommendedTypes.includes(opt.value);
                  const redundantMesure = opt.value === "mesure" && mesureRedondante;
                  return (
                    <button key={opt.value} type="button" onClick={() => enabled && setTypeAnalyse(opt.value)}
                      disabled={!enabled}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                        !enabled
                          ? "border-anthracite-800 bg-anthracite-900/30 opacity-60 cursor-not-allowed"
                          : selected
                            ? "border-cyan-500 bg-cyan-500/10"
                            : recommended
                              ? "border-cyan-500/50 bg-cyan-500/5 hover:border-cyan-400"
                              : "border-anthracite-700 hover:border-anthracite-600"
                      }`}>
                      {showAddon && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5">+{OPTION_CALEPINAGE_PRICE}€</span>
                      )}
                      {recommended && !selected && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5">Recommandé</span>
                      )}
                      <opt.icon className={`w-6 h-6 mb-2 ${selected ? "text-cyan-400" : recommended ? "text-cyan-400/80" : "text-gray-500"}`} />
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                      {!enabled && (
                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                          <Lock className="w-3 h-3" />
                          {redundantMesure ? "Inclus dans Calepinage 3D" : "Non inclus dans votre forfait"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {plan && !plan.abonnementActif && !plan.aUnEssai && (
                <p className="text-xs text-gray-500 mt-2">Souscrivez à un forfait pour créer un projet.</p>
              )}

              <div className="mt-5">
                <p className="text-xs text-gray-400 font-medium mb-2">Forfaits couvrant chaque type d&apos;analyse</p>
                <div className="overflow-hidden rounded-xl border border-anthracite-700/70">
                  <table className="w-full min-w-[680px] text-center text-xs border-separate border-spacing-0 [&_tr:last-child_td]:border-b-0 [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
                    <thead>
                      <tr>
                        <th className="text-left font-semibold text-gray-400 py-2.5 pl-3 pr-2 align-bottom border-b border-r border-anthracite-700/70 bg-anthracite-800/60">
                          Type d&apos;analyse
                        </th>
                        {MATRIX_COLUMNS.map(col => {
                          const isMine = plan?.activePlanIds.includes(col.id);
                          return (
                            <th key={col.id} className={`py-2.5 px-1.5 align-bottom font-semibold border-b border-r border-anthracite-700/70 ${isMine ? "text-cyan-400 bg-cyan-500/10" : "text-gray-400 bg-anthracite-800/60"}`}>
                              {isMine && (
                                <span className="block mx-auto mb-1 w-fit text-[8px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/15 border border-cyan-500/40 rounded-full px-1.5 py-px">
                                  Votre forfait
                                </span>
                              )}
                              <span className="block text-[10px] leading-tight">{col.label}</span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {MATRIX_ROWS.map(row => {
                        const isExtra = row.type === "extra";
                        const isPhotos = row.type === "photos";
                        const available = isExtra ? true
                          : isPhotos ? true
                          : !plan ? true
                          : plan.aUnEssai ? true
                          : row.type === "mesure" && mesureRedondante ? false
                          : plan.activePlanIds.some((pid) => pid && typeAllowedForPlan(row.type as TypeAnalyse, pid));
                        const recommendedRow =
                          !isExtra &&
                          !isPhotos &&
                          plan &&
                          !plan.aUnEssai &&
                          recommendedTypes.includes(row.type as TypeAnalyse);
                        return (
                          <tr key={row.type}>
                            <td className={`py-2.5 pl-3 pr-2 text-left font-medium border-b border-r border-anthracite-700/70 ${isExtra ? "text-amber-400" : available ? "text-cyan-400" : "text-gray-500"}`}>
                              <span className="inline-flex items-center gap-1.5">
                                {isExtra ? (
                                  <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-1.5 py-0.5 shrink-0">À la carte</span>
                                ) : available ? (
                                  <Check className="w-3.5 h-3.5 shrink-0" />
                                ) : null}
                                {row.label}
                                {recommendedRow && (
                                  <span className="inline-block text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-1.5 py-0.5 shrink-0">Recommandé</span>
                                )}
                              </span>
                            </td>
                            {MATRIX_COLUMNS.map(col => {
                              const isPhotosRow = row.type === "photos";
                              const isMine = plan?.activePlanIds.includes(col.id);
                              if (isExtra) {
                                const extraPrice = EXTRA_PROJET_PRICES_CENTS[col.id];
                                return (
                                  <td key={col.id} className={`py-2.5 px-1.5 border-b border-r border-anthracite-700/70 ${isMine ? "bg-cyan-500/10" : ""}`}>
                                    {extraPrice ? (
                                      <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-1.5 py-0.5">{(extraPrice / 100).toLocaleString("fr-FR")}€</span>
                                    ) : (
                                      <span className="text-anthracite-700">—</span>
                                    )}
                                  </td>
                                );
                              }
                              const allowed = isPhotosRow
                                ? col.id !== "particulier-standard" && col.id !== "particulier-premium"
                                : typeAllowedForPlan(row.type as TypeAnalyse, col.id);
                              const payant = allowed && col.id === "starter-mesures" && row.type === "calepinage";
                              return (
                                <td key={col.id} className={`py-2.5 px-1.5 border-b border-r border-anthracite-700/70 ${isMine ? "bg-cyan-500/10" : ""}`}>
                                  {isPhotosRow ? (
                                    allowed ? (
                                      <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-1.5 py-0.5">+5€</span>
                                    ) : (
                                      <span className="text-anthracite-700">—</span>
                                    )
                                  ) : payant ? (
                                    <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-1.5 py-0.5">+10€</span>
                                  ) : allowed ? (
                                    <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${isMine ? "bg-cyan-500/25 text-cyan-400" : "bg-cyan-500/10 text-cyan-500/70"}`}>
                                      <Check className="w-3 h-3" />
                                    </span>
                                  ) : (
                                    <span className="text-anthracite-700">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  {!plan
                    ? "Sélectionnez votre type d'analyse — la disponibilité est recalculée selon votre forfait. Au-delà du quota mensuel, chaque projet supplémentaire est facturé à la carte (19€ Starter Mesures / Starter Mesures+, 15€ Starter Pro, 29€ Solar Pro, 22€ Solar Pro+)."
                    : plan.aUnEssai
                      ? "Essai gratuit : toutes les analyses sont disponibles."
                      : plan.activePlanIds.length > 0
                        ? calepinagePayant
                          ? "Sur Starter Mesures : le calepinage 3D est à +10€ par projet (ou inclus avec l'add-on mensuel « Starter Mesures+ ») et les photos pour inspection à +5€ par projet. Au-delà du quota mensuel, chaque projet supplémentaire est facturé à la carte (19€)."
                          : "Les analyses marquées ✓ sont incluses dans vos forfaits actifs. Les photos pour inspection sont à +5€ par projet. Au-delà du quota mensuel, chaque projet supplémentaire est facturé à la carte : 19€ (Starter Mesures / Starter Mesures+), 15€ (Starter Pro), 29€ (Solar Pro), 22€ (Solar Pro+)."
                        : "Aucun forfait actif — souscrivez pour créer un projet."}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Adresse du chantier</label>
              <input value={adresse} onChange={(e) => setAdresse(e.target.value)}
                className="w-full px-4 py-2.5 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none"
                placeholder="123 rue Exemple, 31000 Toulouse" />
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(2)} disabled={!canGoNext()}
                className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6 space-y-6">
            <UploadZone files={files} onFilesChange={setFiles} />
            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-anthracite-700 text-gray-300 rounded-xl hover:border-anthracite-600 transition-all">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!canGoNext()}
                className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-6 space-y-6">
            <h2 className="font-semibold text-lg">Récapitulatif</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-anthracite-800 rounded-xl border border-anthracite-700">
                <p className="text-gray-500 text-xs">Nom du projet</p>
                <p className="font-medium mt-0.5">{nom}</p>
              </div>
              <div className="p-4 bg-anthracite-800 rounded-xl border border-anthracite-700">
                <p className="text-gray-500 text-xs">Type d&apos;analyse</p>
                <p className="font-medium mt-0.5 capitalize">{typeAnalyse}</p>
              </div>
              {adresse && (
                <div className="p-4 bg-anthracite-800 rounded-xl border border-anthracite-700 sm:col-span-2">
                  <p className="text-gray-500 text-xs">Adresse</p>
                  <p className="font-medium mt-0.5">{adresse}</p>
                </div>
              )}
              <div className="p-4 bg-anthracite-800 rounded-xl border border-anthracite-700">
                <p className="text-gray-500 text-xs">Photos</p>
                <p className="font-medium mt-0.5">{files.length} fichier(s)</p>
              </div>
            </div>

            {plan?.abonnementActif && (
              <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-base">Options du projet</h3>

                <label className="flex items-center justify-between gap-3 p-4 bg-anthracite-800 rounded-xl border border-anthracite-700 cursor-pointer hover:border-cyan-500/40 transition-all">
                  <div>
                    <p className="font-medium">Photos pour inspection</p>
                    <p className="text-xs text-gray-500 mt-0.5">Photos du vol mises à disposition pour l&apos;inspection du bâti</p>
                  </div>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-gray-300 font-medium">+{OPTION_INSPECTION_PRICE}€</span>
                    <input type="checkbox" checked={inspectionPhotos} onChange={(e) => setInspectionPhotos(e.target.checked)}
                      className="w-5 h-5 accent-cyan-500" />
                  </span>
                </label>

                {plan.calepinageActif || plan.aUnEssai || plan.activePlanIds.some((pid) => pid && typeAllowedForPlan("calepinage", pid)) ? (
                  <div className="flex items-center justify-between gap-3 p-4 bg-anthracite-800 rounded-xl border border-anthracite-700">
                    <div>
                      <p className="font-medium">Calepinage 3D</p>
                      <p className="text-xs text-gray-500 mt-0.5">Implantation des panneaux solaires en 3D sur le modèle</p>
                    </div>
                    {calepinagePayant ? (
                      typeAnalyse === "calepinage" ? (
                        <span className="text-sm text-gray-300 font-medium shrink-0">+{OPTION_CALEPINAGE_PRICE}€</span>
                      ) : (
                        <label className="flex items-center gap-3 shrink-0 cursor-pointer">
                          <span className="text-sm text-gray-300 font-medium">+{OPTION_CALEPINAGE_PRICE}€</span>
                          <input type="checkbox" checked={calepinageOption} onChange={(e) => setCalepinageOption(e.target.checked)}
                            className="w-5 h-5 accent-cyan-500" />
                        </label>
                      )
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold text-cyan-300 bg-cyan-500/10 rounded-full shrink-0">Inclus</span>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-anthracite-700">
              <button type="button" onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-anthracite-700 text-gray-300 rounded-xl hover:border-anthracite-600 transition-all">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button type="submit" disabled={loading || uploading}
                className="inline-flex items-center gap-2 px-8 py-3 gradient-cyan text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/25">
                {loading || uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {uploading ? `Upload ${uploadProgress}%` : "Création..."}</>
                ) : "Créer le projet & uploader"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
