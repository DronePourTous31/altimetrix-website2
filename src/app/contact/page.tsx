"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <section className="pt-32 pb-24 min-h-screen flex items-center">
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Message envoyé !</h1>
          <p className="text-gray-400 mb-8">
            Merci ! Nous vous répondrons sous 24h.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all"
          >
            Retour à l&apos;accueil
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gradient">Contactez</span>-nous
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Une question, un projet spécifique ? Notre équipe vous répond sous 24h.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Nom *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Prénom *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                      placeholder="Votre prénom"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                    placeholder="vous@exemple.fr"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Sujet *</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white focus:border-cyan-500/50 focus:outline-none transition-all"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="info">Demande d&apos;information</option>
                    <option value="quote">Demande de devis</option>
                    <option value="support">Support technique</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Message *</label>
                  <textarea
                    rows={6}
                    required
                    className="w-full px-4 py-3 bg-anthracite-800 border border-anthracite-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500/50 focus:outline-none transition-all resize-none"
                    placeholder="Décrivez votre projet ou votre question..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-2xl p-8">
                <h2 className="text-xl font-bold mb-6">Nos coordonnées</h2>
                <div className="space-y-5">
                  {[
                    { icon: Mail, label: "Email", value: "contact@altimetrix.fr" },
                    { icon: Phone, label: "Téléphone", value: "+33 (0)6 12 34 56 78" },
                    { icon: MapPin, label: "Adresse", value: "12 Rue de la Photogrammétrie, 75001 Paris" },
                    { icon: Clock, label: "Disponibilité", value: "Lun-Ven : 9h-18h" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 gradient-cyan rounded-lg flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">{item.label}</div>
                        <div className="font-medium">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500/5 to-transparent border border-cyan-500/20 rounded-2xl p-8 text-center">
                <h3 className="font-semibold mb-2">Vous êtes artisan ?</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Découvrez nos formules adaptées à votre activité
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all text-sm"
                >
                  Voir les tarifs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
