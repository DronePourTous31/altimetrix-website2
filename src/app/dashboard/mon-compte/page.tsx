"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check, AlertCircle, CreditCard, FileText, Gift } from "lucide-react";

interface Profile {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  siret: string;
  type_compte: "artisan" | "particulier";
  abonnement_actif: boolean;
  forfait_id: string | null;
  essais_gratuits_restants: number;
}

interface Forfait {
  id: string;
  nom: string;
  prix_mensuel: number;
}

interface Commande {
  id: string;
  montant: number;
  statut: string;
  created_at: string;
  forfaits: { nom: string } | null;
}

export default function MonComptePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile({ ...prof, email: user.email || "" });
        setPrenom(prof.prenom);
        setNom(prof.nom);
        setTelephone(prof.telephone || "");
      }

      const { data: forf } = await supabase.from("forfaits").select("*");
      if (forf) setForfaits(forf);

      const { data: cmd } = await supabase
        .from("commandes")
        .select("*, forfaits(nom)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cmd) setCommandes(cmd);
      setLoading(false);
    };
    fetch();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase
      .from("profiles")
      .update({ prenom, nom, telephone: telephone || null })
      .eq("id", profile!.id);

    if (err) {
      setError("Erreur lors de la sauvegarde.");
    } else {
      setSaved(true);
      setProfile((prev) => prev ? { ...prev, prenom, nom, telephone } : prev);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const forfaitActuel = forfaits.find((f) => f.id === profile?.forfait_id);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-dark-800 mb-8 font-heading">{profile ? `${profile.prenom} ${profile.nom}` : "Mon compte"}</h1>

      {/* INFORMATIONS PERSONNELLES */}
      <div className="bg-white rounded-xl border border-dark-100 p-6 mb-6">
        <h2 className="font-semibold text-dark-800 mb-5">Informations personnelles</h2>

        {saved && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
            <Check className="w-4 h-4" /> Modifications enregistrées.
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">Prénom</label>
              <input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">Nom</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-600 mb-1">Email</label>
            <input
              value={profile?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-dark-200 bg-dark-50 text-dark-400 cursor-not-allowed"
            />
            <p className="text-xs text-dark-400 mt-1">L&apos;email ne peut pas être modifié.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-600 mb-1">Téléphone</label>
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-dark-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="06 12 34 56 78"
            />
          </div>
          {profile?.siret && (
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">SIRET</label>
              <p className="text-dark-800 text-sm">{profile.siret}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:bg-primary-400 text-white font-semibold text-sm transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Sauvegarde..." : "Enregistrer"}
          </button>
        </form>
      </div>

      {/* ESSAIS GRATUITS */}
      {!profile?.abonnement_actif && (profile?.essais_gratuits_restants ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-green-200 p-6 mb-6">
          <div className="flex items-start gap-3">
            <Gift className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-dark-800 mb-1">Essais gratuits</h2>
              <p className="text-sm text-dark-600">
                Il vous reste <strong className="text-green-700">{profile?.essais_gratuits_restants} essai{profile?.essais_gratuits_restants !== 1 ? "s" : ""} gratuit{profile?.essais_gratuits_restants !== 1 ? "s" : ""}</strong>.
                Créez un projet pour tester AltiMetrix sans aucun engagement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FORFAIT */}
      <div className="bg-white rounded-xl border border-dark-100 p-6 mb-6">
        <h2 className="font-semibold text-dark-800 mb-2">Forfait</h2>
        {forfaitActuel ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-800 font-medium">{forfaitActuel.nom}</p>
              <p className="text-sm text-dark-500">{forfaitActuel.prix_mensuel / 100}€/mois</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              profile?.abonnement_actif ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {profile?.abonnement_actif ? "Actif" : "Inactif"}
            </span>
          </div>
        ) : (
          <p className="text-dark-500 text-sm mb-4">Aucun abonnement actif.</p>
        )}
        <div className="mt-4 pt-4 border-t border-dark-100">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            <CreditCard className="w-4 h-4" /> Gérer mon abonnement (Stripe Customer Portal)
          </a>
        </div>
      </div>

      {/* HISTORIQUE COMMANDES */}
      <div className="bg-white rounded-xl border border-dark-100 p-6">
        <h2 className="font-semibold text-dark-800 mb-4">Historique des commandes</h2>
        {commandes.length > 0 ? (
          <div className="divide-y divide-dark-100">
            {commandes.map((cmd) => (
              <div key={cmd.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-dark-400" />
                  <div>
                    <p className="text-sm text-dark-800">
                      {cmd.forfaits?.nom || "Commande"} — {(cmd.montant / 100).toFixed(2)}€
                    </p>
                    <p className="text-xs text-dark-400">
                      {new Date(cmd.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  cmd.statut === "payee" ? "bg-green-100 text-green-700" :
                  cmd.statut === "echec" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {cmd.statut === "payee" ? "Payée" : cmd.statut === "echec" ? "Échec" : "En attente"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-dark-500 text-sm">Aucune commande pour le moment.</p>
        )}
      </div>
    </div>
  );
}
