"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, AlertCircle, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    type_compte: "particulier" as "artisan" | "particulier",
    siret: "",
    cgu: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.cgu) {
      setError("Vous devez accepter les conditions générales d'utilisation.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          prenom: form.prenom,
          nom: form.nom,
          type_compte: form.type_compte,
        },
      },
    });

    if (authError) {
      const messages: Record<string, string> = {
        "User already registered": "Cet email est déjà inscrit. Connectez-vous.",
        "Password should be at least 6 characters": "Le mot de passe doit faire au moins 6 caractères.",
        "Unable to validate email address: invalid format": "Format d'email invalide.",
      };
      setError(messages[authError.message] || "Une erreur est survenue. Réessayez.");
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        prenom: form.prenom,
        nom: form.nom,
        type_compte: form.type_compte,
        siret: form.siret || null,
      });

      if (profileError) {
        setError("Erreur lors de la création du profil. Contactez le support.");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-dark-50 to-white py-20">
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-dark-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-dark-800 font-heading">Créer un compte</h1>
            <p className="text-dark-500 text-sm mt-2">
              Rejoignez AltiMetrix et lancez votre premier projet
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mb-6">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-dark-600 mb-1.5">
                  Prénom
                </label>
                <input
                  id="prenom"
                  value={form.prenom}
                  onChange={(e) => updateField("prenom", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-dark-600 mb-1.5">
                  Nom
                </label>
                <input
                  id="nom"
                  value={form.nom}
                  onChange={(e) => updateField("nom", e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-600 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="vous@exemple.fr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-600 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="6 caractères minimum"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1.5">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["particulier", "artisan"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField("type_compte", type)}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.type_compte === type
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-dark-200 text-dark-500 hover:border-dark-300"
                    }`}
                  >
                    {type === "artisan" ? "Artisan / Pro" : "Particulier"}
                  </button>
                ))}
              </div>
            </div>

            {form.type_compte === "artisan" && (
              <div>
                <label htmlFor="siret" className="block text-sm font-medium text-dark-600 mb-1.5">
                  Numéro SIRET <span className="text-dark-400">(optionnel)</span>
                </label>
                <input
                  id="siret"
                  value={form.siret}
                  onChange={(e) => updateField("siret", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="123 456 789 00010"
                />
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.cgu}
                onChange={(e) => updateField("cgu", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-dark-500">
                J&apos;accepte les{" "}
                <a href="#" className="text-primary-600 hover:underline">conditions générales d&apos;utilisation</a>{" "}
                et la{" "}
                <a href="#" className="text-primary-600 hover:underline">politique de confidentialité</a>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-primary-400 text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-dark-500 mt-6">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-500 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
