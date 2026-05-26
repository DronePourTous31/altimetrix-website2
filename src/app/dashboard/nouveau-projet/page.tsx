"use client";

import { useState, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import UploadZone from "@/components/projects/UploadZone";
import { ArrowLeft, ArrowRight, Check, Ruler, Sun, Sparkles, Loader2, AlertCircle } from "lucide-react";

type Step = 1 | 2 | 3;
type TypeAnalyse = "mesure" | "solaire" | "pro";
type CategoryType = "NADIR" | "OBLIQUE1" | "OBLIQUE2" | "OBLIQUE3" | "OBLIQUE4";

interface CategorizedFile {
  file: File;
  category: CategoryType;
}

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

  const [files, setFiles] = useState<CategorizedFile[]>([]);

  const canGoNext = () => {
    if (step === 1) return nom.trim().length > 0;
    if (step === 2) return files.length >= 20;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/create-projet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, adresse, typeAnalyse }),
    });

    if (!res.ok) {
      if (res.status === 401) { router.push("/auth/login"); return; }
      setError("Erreur lors de la création du projet. Réessayez.");
      setLoading(false);
      return;
    }

    const { projet, clientName: apiClientName, profile } = await res.json();
    const clientName = apiClientName;

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

        await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
      uploaded++;
      setUploadProgress(Math.round((uploaded / files.length) * 100));
    }
    setUploading(false);

    const { redirect } = await fetch("/api/finaliser-projet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analyseOptions.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setTypeAnalyse(opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      typeAnalyse === opt.value
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-anthracite-700 hover:border-anthracite-600"
                    }`}>
                    <opt.icon className={`w-6 h-6 mb-2 ${typeAnalyse === opt.value ? "text-cyan-400" : "text-gray-500"}`} />
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                  </button>
                ))}
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
