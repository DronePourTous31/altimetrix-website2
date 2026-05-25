"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Save, User, Bell, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <section className="pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-cyan-400 flex items-center gap-1 mb-4">
            <ChevronRight className="w-3 h-3 rotate-180" /> Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-gray-400 mt-1">Gérez votre compte et vos préférences</p>
        </div>

        <div className="space-y-8">
          {/* Profile */}
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-2xl p-6">
            <h2 className="font-semibold mb-6 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Informations personnelles
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Nom complet</label>
                <input
                  type="text"
                  defaultValue="Jean Dupont"
                  className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="jean@exemple.fr"
                  className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  defaultValue="06 12 34 56 78"
                  className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Entreprise</label>
                <input
                  type="text"
                  defaultValue="Dupont Couverture"
                  className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-2xl p-6">
            <h2 className="font-semibold mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              Notifications
            </h2>
            <div className="space-y-4">
              {[
                "Notification par email quand un projet est terminé",
                "Rappel mensuel des projets restants",
                "Offres et mises à jour AltiMetrix",
              ].map((setting) => (
                <label key={setting} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-anthracite-600 bg-anthracite-800 text-cyan-500 focus:ring-cyan-500/20"
                  />
                  <span className="text-sm text-gray-300">{setting}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Plan */}
          <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-2xl p-6">
            <h2 className="font-semibold mb-6 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              Abonnement
            </h2>
            <div className="flex items-center justify-between p-4 bg-anthracite-800 rounded-xl border border-anthracite-700">
              <div>
                <div className="font-medium">Mesures Pro</div>
                <div className="text-sm text-gray-400">119€/mois - 10 projets/mois</div>
                <div className="text-xs text-gray-500 mt-1">Prochains renouvellement : 24/06/2026</div>
              </div>
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm border border-anthracite-600 text-gray-300 rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
              >
                Changer de forfait
              </Link>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {saved && <span className="text-green-400">Modifications enregistrées ✓</span>}
            </div>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
