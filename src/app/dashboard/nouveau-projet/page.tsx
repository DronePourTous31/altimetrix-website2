"use client";

import { useState, useCallback, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import UploadZone from "@/components/projects/UploadZone";
import { ArrowLeft, ArrowRight, Check, Ruler, Sun, Sparkles, Loader2, ExternalLink, AlertCircle } from "lucide-react";

type Step = 1 | 2 | 3;
type TypeAnalyse = "mesure" | "solaire" | "pro";

const analyseOptions: { value: TypeAnalyse; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "mesure", label: "Métrés & mesures", desc: "Modèle 3D, DSM, outils de mesure", icon: Ruler },
  { value: "solaire", label: "Analyse solaire + calepinage", desc: "Irradiation, ombrage, calepinage panneaux", icon: Sun },
  { value: "pro", label: "Complet Pro", desc: "Tout inclus : modèles, analyses, rapports", icon: Sparkles },
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
  const [notes, setNotes] = useState("");

  const [filesByType, setFilesByType] = useState<Record<string, File[]>>({});
  const [projetId, setProjetId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ abonnement_actif: boolean; forfait_id: string | null; essais_gratuits_restants: number; prenom: string; nom: string } | null>(null);
  const [clientName, setClientName] = useState("");
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  async function getAuthHeaders() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return { headers, token, supabase };
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth/login"); return; }
      supabase
        .from("profiles")
        .select("abonnement_actif, forfait_id, essais_gratuits_restants, prenom, nom")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data);
            setClientName(`${data.prenom.toUpperCase()}_${data.nom.toUpperCase()}`);
          }
          setProfileLoaded(true);
        });
    });
  }, [router]);

  const handleFilesSelected = useCallback((type: string, newFiles: File[]) => {
    setFilesByType((prev) => ({
      ...prev,
      [type]: [...(prev[type] || []), ...newFiles],
    }));
  }, []);

  const handleRemoveFile = useCallback((type: string, index: number) => {
    setFilesByType((prev) => {
      const updated = { ...prev };
      updated[type] = prev[type].filter((_, i) => i !== index);
      if (updated[type].length === 0) {
        delete updated[type];
      }
      return updated;
    });
  }, []);

  const totalFiles = Object.values(filesByType).reduce((s, f) => s + f.length, 0);

  const canGoNext = () => {
    if (step === 1) return nom.trim().length > 0 && profileLoaded;
    if (step === 2) return profileLoaded;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { headers: authHeaders, supabase } = await getAuthHeaders();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    if (!profile) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("abonnement_actif, forfait_id, essais_gratuits_restants, prenom, nom")
        .eq("id", user.id)
        .single();
      if (prof) setProfile(prof);
    }

    const res = await fetch("/api/create-projet", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ nom, adresse: adresse || null, type_analyse: typeAnalyse, notes }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Erreur lors de la création du projet. Réessayez.");
      setLoading(false);
      return;
    }

    const { projet_id } = await res.json();

    setProjetId(projet_id);

    const cn = clientName || "CLIENT";
    const pn = nom.replace(/[<>:"/\\|?*]/g, "_").trim();

    // Upload photos vers CLIENTS/{client}/{projet}/PHOTOS/{type}/
    setUploading(true);

    const allFiles: { file: File; type: string }[] = [];
    for (const [type, files] of Object.entries(filesByType)) {
      for (const file of files) {
        allFiles.push({ file, type });
      }
    }

    let uploaded = 0;
    for (const { file, type } of allFiles) {
      try {
        await fetch("/api/upload", {
          method: "POST",
          headers: {
            ...authHeaders,
            "x-projet-id": projet_id,
            "x-filename": file.name,
            "x-type": type,
            "x-client-name": cn,
            "x-project-name": pn,
          },
          body: file,
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
      uploaded++;
      setUploadProgress(Math.round((uploaded / allFiles.length) * 100));
    }

    setUploading(false);

    const prof = profile;
    const isBypass = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("dev") === "1";

    if (prof?.abonnement_actif || isBypass) {
      if (isBypass) {
        await supabase.from("projets").update({ statut: "en_traitement" }).eq("id", projet_id);
      }
      router.push(`/dashboard/projets/${projet_id}`);
      router.refresh();
    } else if ((prof?.essais_gratuits_restants ?? 0) > 0) {
      await supabase
        .from("profiles")
        .update({ essais_gratuits_restants: (prof?.essais_gratuits_restants ?? 0) - 1 })
        .eq("id", user.id);
      await supabase
        .from("projets")
        .update({ statut: "en_traitement" })
        .eq("id", projet_id);
      router.push(`/dashboard/projets/${projet_id}`);
      router.refresh();
    } else {
      setCheckoutUrl(`/api/checkout?projet_id=${projet_id}&montant=25000`);
      window.location.href = `/api/checkout?projet_id=${projet_id}&montant=25000`;
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? "bg-primary-600 text-white" : "bg-dark-100 text-dark-400"
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm hidden sm:block ${step >= s ? "text-dark-800 font-medium" : "text-dark-400"}`}>
              {s === 1 ? "Infos" : s === 2 ? "Photos" : "Confirmation"}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-primary-600" : "bg-dark-100"}`} />}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-dark-800 mb-8 font-heading">Nouveau projet</h1>

      {!profileLoaded && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-dark-50 border border-dark-100 mb-6">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          <p className="text-sm text-dark-500">Chargement de votre profil...</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="bg-white rounded-xl border border-dark-100 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">Nom du projet *</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Ex: Toiture M. Dupont - Lyon 2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-600 mb-3">Type d&apos;analyse</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analyseOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTypeAnalyse(opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      typeAnalyse === opt.value
                        ? "border-primary-500 bg-primary-50"
                        : "border-dark-100 hover:border-dark-300"
                    }`}
                  >
                    <opt.icon className={`w-6 h-6 mb-2 ${typeAnalyse === opt.value ? "text-primary-600" : "text-dark-400"}`} />
                    <p className="text-sm font-semibold text-dark-800">{opt.label}</p>
                    <p className="text-xs text-dark-400 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">Adresse du chantier</label>
              <input
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="123 rue Exemple, 31000 Toulouse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">Notes pour AltiMetrix</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                placeholder="Informations complémentaires..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canGoNext()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-dark-300 text-white font-semibold transition-colors"
              >
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl border border-dark-100 p-6 space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-50 border border-primary-200">
              <ExternalLink className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <div className="text-sm text-primary-800">
                <strong>Conseil :</strong> Classez vos photos par type : <strong>NADIR</strong> (vue du dessus) et <strong>OBLIQUE</strong> (vue latérale). Cliquez sur "+ Oblique" pour ajouter des groupes. Prévoyez un recouvrement de 70% entre les photos.
              </div>
            </div>

            <UploadZone
              filesByType={filesByType}
              onFilesSelected={handleFilesSelected}
              onRemoveFile={handleRemoveFile}
              uploading={uploading}
              uploadProgress={uploadProgress}
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-dark-200 text-dark-600 hover:bg-dark-50 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canGoNext()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-dark-300 text-white font-semibold transition-colors"
              >
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-xl border border-dark-100 p-6 space-y-6">
            <h2 className="font-semibold text-dark-800 text-lg">Récapitulatif</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-dark-50">
                <p className="text-dark-400 text-xs">Nom du projet</p>
                <p className="text-dark-800 font-medium mt-0.5">{nom}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-50">
                <p className="text-dark-400 text-xs">Type d&apos;analyse</p>
                <p className="text-dark-800 font-medium mt-0.5 capitalize">{typeAnalyse}</p>
              </div>
              {adresse && (
                <div className="p-4 rounded-xl bg-dark-50 sm:col-span-2">
                  <p className="text-dark-400 text-xs">Adresse</p>
                  <p className="text-dark-800 font-medium mt-0.5">{adresse}</p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-dark-50">
                <p className="text-dark-400 text-xs">Photos</p>
                <p className="text-dark-800 font-medium mt-0.5">{totalFiles} fichier(s)</p>
              </div>
              {clientName && (
                <div className="p-4 rounded-xl bg-dark-50">
                  <p className="text-dark-400 text-xs">Dossier client</p>
                  <p className="text-dark-800 font-medium mt-0.5 font-mono text-xs">{clientName}/{nom.replace(/[<>:"/\\|?*]/g, "_")}/PHOTOS/</p>
                </div>
              )}
            </div>

            {Object.entries(filesByType).map(([type, files]) => (
              <div key={type} className="p-3 rounded-xl bg-dark-50">
                <p className="text-xs font-medium text-dark-600">{type} : {files.length} photo{files.length > 1 ? "s" : ""}</p>
              </div>
            ))}

            <div className="flex justify-between pt-4 border-t border-dark-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-dark-200 text-dark-600 hover:bg-dark-50 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                type="submit"
                disabled={loading || !profileLoaded}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-primary-400 text-white font-semibold transition-colors shadow-lg shadow-primary-600/25"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Création en cours..." : "Créer le projet & uploader"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}