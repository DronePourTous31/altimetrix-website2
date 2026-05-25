"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, AlertCircle, User, Mail, Lock, Building2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", password: "",
    type_compte: "particulier" as "artisan" | "particulier",
    siret: "", cgu: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.cgu) { setError("Vous devez accepter les conditions générales."); return; }
    setLoading(true);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { prenom: form.prenom, nom: form.nom, type_compte: form.type_compte } },
    });

    if (authError) {
      const messages: Record<string, string> = {
        "User already registered": "Cet email est déjà inscrit. Connectez-vous.",
        "Password should be at least 6 characters": "Le mot de passe doit faire au moins 6 caractères.",
        "Unable to validate email address: invalid format": "Format d'email invalide.",
      };
      setError(messages[authError.message] || "Une erreur est survenue. Réessayez.");
      setLoading(false); return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        prenom: form.prenom,
        nom: form.nom,
        type_compte: form.type_compte,
        siret: form.siret || null,
        essais_gratuits_restants: 2,
      });
      if (profileError) {
        setError("Erreur lors de la création du profil. Contactez le support.");
        setLoading(false); return;
      }
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <section className="pt-32 pb-24 min-h-screen flex items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
      <div className="relative max-w-lg mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 gradient-cyan rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-3xl font-bold">Créer mon compte</h1>
          <p className="text-gray-400 mt-2">Rejoignez AltiMetrix et lancez votre premier projet</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prénom *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={form.prenom} onChange={(e) => updateField("prenom", e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                  placeholder="Jean" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nom *</label>
              <input value={form.nom} onChange={(e) => updateField("nom", e.target.value)} required
                className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="Dupont" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required
                className="w-full pl-10 pr-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="vous@exemple.fr" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => updateField("password", e.target.value)} required minLength={6}
                className="w-full pl-10 pr-12 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="6 caractères minimum" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Type de compte</label>
            <div className="grid grid-cols-2 gap-3">
              {(["particulier", "artisan"] as const).map((type) => (
                <button key={type} type="button" onClick={() => updateField("type_compte", type)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type_compte === type
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-anthracite-700 text-gray-400 hover:border-anthracite-600"
                  }`}>
                  {type === "artisan" ? "Artisan / Pro" : "Particulier"}
                </button>
              ))}
            </div>
          </div>

          {form.type_compte === "artisan" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Numéro SIRET <span className="text-gray-500">(optionnel)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={form.siret} onChange={(e) => updateField("siret", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                  placeholder="123 456 789 00010" />
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.cgu} onChange={(e) => updateField("cgu", e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-anthracite-600 bg-anthracite-800 text-cyan-500 focus:ring-cyan-500/20" />
            <span className="text-sm text-gray-400">
              J&apos;accepte les{" "}
              <Link href="/legal/cgv" className="text-cyan-400 hover:text-cyan-300">conditions générales</Link>{" "}
              et la{" "}
              <Link href="/legal/rgpd" className="text-cyan-400 hover:text-cyan-300">politique de confidentialité</Link>
            </span>
          </label>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
