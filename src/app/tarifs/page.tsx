"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, HelpCircle, Zap, Sun, Briefcase, Sparkles, ChevronRight } from "lucide-react";

type Billing = "monthly" | "yearly";

const yearlyDiscount = 0.15;

interface Plan {
  name: string;
  monthly: number;
  desc: string;
  popular?: boolean;
  icon: React.ElementType;
  features: string[];
  cta: string;
}

const plans: Plan[] = [
  {
    name: "Mesure",
    monthly: 69,
    icon: Briefcase,
    desc: "Idéal pour les métrés et relevés ponctuels.",
    features: [
      "3 projets/mois",
      "Modèle 3D + mesures précises",
      "DSM haute résolution",
      "Rapport de métrés PDF",
      "Outils de mesure en ligne",
    ],
    cta: "Choisir Mesure",
  },
  {
    name: "Solaire",
    monthly: 99,
    icon: Sun,
    desc: "Pour les installateurs photovoltaïques et couvreurs.",
    popular: true,
    features: [
      "3 projets/mois",
      "Tout Mesure +",
      "Analyse d'irradiation",
      "Calepinage panneaux solaires",
      "Calcul de production annuelle",
      "Étude d'ombrage",
    ],
    cta: "Choisir Solaire",
  },
  {
    name: "Pro",
    monthly: 149,
    icon: Zap,
    desc: "Volume élevé et fonctionnalités avancées.",
    features: [
      "10 projets/mois inclus",
      "Tout Solaire +",
      "Mission planner prioritaire",
      "Support dédié sous 2h",
      "API d'intégration",
      "Pipeline personnalisé",
    ],
    cta: "Choisir Pro",
  },
];

const extras = [
  { title: "Inspection toiture avec rapport", price: "Sur devis" },
  { title: "Calcul de volume (stockpile)", price: "Sur devis" },
  { title: "Santé végétale / golf", price: "Sur devis" },
  { title: "Relevé topographique / étude de niveaux", price: "Sur devis" },
  { title: "Photo/vidéo drone immobilier", price: "Sur devis" },
];

export default function TarifsPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <>
      {/* HEADER */}
      <section className="bg-gradient-to-br from-dark-800 to-dark-900 text-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/20 text-primary-300 text-sm font-medium mb-5 border border-primary-500/30"
          >
            <Sparkles className="w-4 h-4" /> Paiement sécurisé par Stripe
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold mb-4 font-heading"
          >
            Tarifs & Abonnements
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-dark-200 max-w-2xl mx-auto text-lg"
          >
            Une solution pour chaque besoin, du particulier ponctuel au professionnel intensif.
          </motion.p>
        </div>
      </section>

      {/* ONE SHOT */}
      <section className="py-16 lg:py-20 bg-white border-b border-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
              One shot
            </span>
            <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">Pour les particuliers & artisans ponctuels</h2>
            <p className="text-dark-500 mb-8">Un projet, un prix. Idéal pour vérifier un devis ou réaliser un premier relevé.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg mx-auto"
          >
            <div className="rounded-2xl border-2 border-primary-200 bg-primary-50/50 p-8 text-center">
              <p className="text-dark-500 text-sm font-medium mb-1">À partir de</p>
              <div className="text-5xl font-bold text-dark-800 mb-2 font-heading">250<span className="text-2xl">€</span></div>
              <p className="text-dark-500 text-sm mb-6">TTC — Livraison sous 48h</p>
              <ul className="text-left space-y-3 mb-8 max-w-sm mx-auto">
                {[
                  "Captation par vos soins (tutoriel inclus)",
                  "Traitement photogrammétrique complet",
                  "Modèle 3D + DSM + outils de mesure",
                  "Rapport PDF métrés et analyses",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-dark-600 text-sm">
                    <Check className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-dark-400 text-xs mb-6">
                Option captation par AltiMetrix : <span className="font-semibold text-dark-600">+150€</span> (sur devis)
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors shadow-lg shadow-primary-600/25"
              >
                Commander un projet
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABONNEMENTS */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
              Abonnements artisans
            </span>
            <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">Pour les professionnels réguliers</h2>
            <p className="text-dark-500 mb-8 text-lg">Des formules adaptées à votre volume d&apos;activité.</p>

            {/* TOGGLE */}
            <div className="inline-flex items-center gap-4 bg-dark-100 rounded-full p-1.5">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  billing === "monthly" ? "bg-white text-dark-800 shadow-sm" : "text-dark-500 hover:text-dark-700"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  billing === "yearly" ? "bg-white text-dark-800 shadow-sm" : "text-dark-500 hover:text-dark-700"
                }`}
              >
                Annuel <span className="text-primary-600 text-xs ml-1">-15%</span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => {
              const price = billing === "yearly" ? Math.round(plan.monthly * (1 - yearlyDiscount)) : plan.monthly;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className={`rounded-2xl p-8 border-2 transition-all flex flex-col relative ${
                    plan.popular
                      ? "border-primary-500 bg-primary-50/50 shadow-xl scale-[1.02] md:scale-105"
                      : "border-dark-100 hover:border-primary-200 bg-white"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary-600 text-white text-xs font-bold shadow-lg">
                      Populaire
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.popular ? "bg-primary-600" : "bg-dark-100"
                    }`}>
                      <plan.icon className={`w-5 h-5 ${plan.popular ? "text-white" : "text-dark-600"}`} />
                    </div>
                    <h3 className={`text-xl font-bold font-heading ${plan.popular ? "text-primary-700" : "text-dark-800"}`}>
                      {plan.name}
                    </h3>
                  </div>
                  <p className="text-dark-500 text-sm mb-6">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-dark-800">{price}</span>
                    <span className="text-dark-500 text-sm ml-1">€/mois</span>
                    {billing === "yearly" && (
                      <span className="block text-xs text-primary-600 mt-1">
                        {(plan.monthly * 12).toFixed(0)}€/an au lieu de {(plan.monthly * 12 * (1 / (1 - yearlyDiscount))).toFixed(0)}€
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-dark-600">
                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${
                          plan.popular ? "text-primary-600" : "text-dark-400"
                        }`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    <Link
                      href={`/auth/register?plan=${plan.name.toLowerCase()}&billing=${billing}`}
                      className={`block w-full text-center py-3.5 rounded-xl font-semibold transition-colors ${
                        plan.popular
                          ? "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/25"
                          : "bg-dark-700 hover:bg-dark-600 text-white"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                    <p className="text-center text-xs text-dark-400 flex items-center justify-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Volume plus important ? <Link href="#extras" className="text-primary-600 hover:underline">Nous contacter</Link>
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRESTATIONS COMPLÉMENTAIRES */}
      <section id="extras" className="py-16 lg:py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-dark-800 mb-4 font-heading">Prestations complémentaires</h2>
            <p className="text-dark-500 max-w-2xl mx-auto">
              Des services sur mesure pour vos besoins spécifiques. Devis personnalisé sous 24h.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto divide-y divide-dark-200 rounded-2xl border border-dark-200 bg-white overflow-hidden"
          >
            {extras.map((item) => (
              <div key={item.title} className="flex items-center justify-between px-6 py-4 hover:bg-dark-50 transition-colors">
                <span className="text-dark-700 font-medium text-sm">{item.title}</span>
                <span className="text-primary-600 font-semibold text-sm">{item.price}</span>
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 font-semibold transition-colors"
            >
              Demander un devis <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 lg:py-20 bg-dark-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-6 font-heading"
          >
            Vous ne trouvez pas la formule qu&apos;il vous faut ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-dark-200 mb-8 text-lg"
          >
            Contactez-nous pour un abonnement sur mesure adapté à votre activité.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="mailto:contact@altimetrix.fr"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors shadow-xl shadow-primary-600/25"
            >
              Nous contacter
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
