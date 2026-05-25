"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Shield, Timer, Target, ClipboardCheck, Users, FileText, ChevronRight, Camera, Upload, Download, Sparkles, Check } from "lucide-react";

function AnimatedCounter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(to / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function LetterReveal({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.4, delay: i * 0.03, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

function FadeInSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const advantages = [
  { icon: Shield, title: "Sécurité", desc: "Ne montez plus jamais sur une toiture. Votre drone fait le travail à votre place." },
  { icon: Timer, title: "Gain de temps", desc: "Relevé complet en quelques minutes de vol, traitement automatisé en 48h." },
  { icon: Target, title: "Précision absolue", desc: "Erreur inférieure à 2 cm/m. Des mesures fiables pour vos devis." },
  { icon: ClipboardCheck, title: "Aucun déplacement oublié", desc: "Toutes vos cotes sont dans le modèle 3D. Fini les allers-retours sur site." },
  { icon: Users, title: "Effet wow client", desc: "Présentez un jumeau numérique de son projet. Un argument de vente imparable." },
  { icon: FileText, title: "Rapports pro", desc: "Exportez vos devis et analyses directement depuis la plateforme." },
];

const steps = [
  { icon: Camera, title: "Vous captez les photos", desc: "Avec votre drone, réalisez un vol simple au-dessus du site. Notre tutoriel vous guide pas à pas." },
  { icon: Upload, title: "Vous uploadez sur AltiMetrix", desc: "Déposez vos photos sur la plateforme. Notre pipeline de traitement s'exécute automatiquement." },
  { icon: Download, title: "Vous recevez tout le livrable", desc: "Modèle 3D, DSM, analyses solaires et rapports PDF. Prêts à présenter à vos clients." },
];

const useCases = [
  {
    id: "couvreurs",
    label: "Couvreurs & toitures",
    desc: "Relevés de toiture sans échafaudage ni risque de chute. Idéal pour métrés, devis et diagnostics.",
    deliverables: ["Modèle 3D texturé de la toiture", "DSM haute résolution", "Mesures de surface et pente", "Rapport PDF métré"],
  },
  {
    id: "solaire",
    label: "Installateurs solaires",
    desc: "Calepinage de panneaux optimisé, analyse d'ombrage et calcul de production annuelle.",
    deliverables: ["Analyse d'irradiation solaire", "Calepinage photovoltaïque", "Calcul de production", "Étude d'ombrage"],
  },
  {
    id: "piscine",
    label: "Piscines & aménagement",
    desc: "Implantation 3D de votre piscine, terrasse ou abri de jardin avec mesures précises.",
    deliverables: ["Modèle 3D du terrain", "Implantation piscine/abri", "Calcul de volume (terrassement)", "Vue d'intégration paysagère"],
  },
  {
    id: "particulier",
    label: "Particuliers & vérification",
    desc: "Vous avez un devis ? Faites vérifier les quantités et surfaces par un relevé objectif.",
    deliverables: ["Relevé complet du bien", "Comparaison devis/réalité", "Modèle 3D consultable", "Rapport d'expertise"],
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState(useCases[0].id);

  return (
    <>
      {/* 1. HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-600/20 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/20 text-primary-300 text-sm font-medium mb-6 border border-primary-500/30"
            >
              <Sparkles className="w-4 h-4" /> Photogrammétrie par drone nouvelle génération
            </motion.p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 font-heading">
              <LetterReveal text="Votre chantier en 3D." />
              <br />
              <span className="text-primary-400">
                <LetterReveal text="Sans monter sur le toit." />
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-lg sm:text-xl text-dark-200 mb-10 max-w-2xl leading-relaxed"
            >
              Plus de sécurité, plus de vitesse, plus de précision. Vous captez les photos avec votre drone, 
              nous transformons vos données en modèles 3D exploitables, analyses solaires et rapports professionnels.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold text-lg transition-all shadow-xl shadow-primary-600/25 hover:shadow-primary-500/40"
              >
                Démarrer mon premier projet
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border-2 border-dark-400 hover:border-primary-400 text-dark-200 hover:text-primary-400 font-semibold text-lg transition-colors"
              >
                Voir la démo
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. AVANTAGES */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2 className="text-4xl font-bold text-dark-800 text-center mb-4 font-heading">
              Pourquoi AltiMetrix ?
            </h2>
            <p className="text-dark-500 text-center max-w-2xl mx-auto mb-16 text-lg">
              La photogrammétrie par drone appliquée aux métiers du bâtiment et de l&apos;aménagement.
            </p>
          </FadeInSection>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((adv, i) => (
              <FadeInSection key={adv.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group p-8 rounded-2xl border border-dark-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors">
                    <adv.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-800 mb-3 font-heading">{adv.title}</h3>
                  <p className="text-dark-500 leading-relaxed">{adv.desc}</p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMMENT ÇA MARCHE */}
      <section className="py-20 lg:py-28 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2 className="text-4xl font-bold text-dark-800 text-center mb-4 font-heading">
              Comment ça marche
            </h2>
            <p className="text-dark-500 text-center max-w-2xl mx-auto mb-16 text-lg">
              Trois étapes simples pour passer de votre drone au livrable final.
            </p>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-dark-200">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" style={{ width: "100%" }} />
            </div>
            {steps.map((step, i) => (
              <FadeInSection key={step.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative flex flex-col items-center text-center p-8"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-primary-600/30">
                    {i + 1}
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                    <step.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark-800 mb-3 font-heading">{step.title}</h3>
                  <p className="text-dark-500 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CAS D'USAGE */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2 className="text-4xl font-bold text-dark-800 text-center mb-4 font-heading">
              Pour qui ?
            </h2>
            <p className="text-dark-500 text-center max-w-2xl mx-auto mb-12 text-lg">
              Des solutions adaptées à chaque métier.
            </p>
          </FadeInSection>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {useCases.map((uc) => (
              <button
                key={uc.id}
                onClick={() => setActiveTab(uc.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === uc.id
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                    : "bg-dark-100 text-dark-600 hover:bg-dark-200"
                }`}
              >
                {uc.label}
              </button>
            ))}
          </div>
          {useCases.map((uc) => (
            <motion.div
              key={uc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={activeTab === uc.id ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className={activeTab === uc.id ? "block" : "hidden"}
            >
              <div className="max-w-3xl mx-auto bg-dark-50 rounded-2xl p-8 md:p-10">
                <p className="text-dark-600 text-lg mb-6 leading-relaxed">{uc.desc}</p>
                <h4 className="font-semibold text-dark-800 mb-4 font-heading">Livrables inclus :</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uc.deliverables.map((d) => (
                    <li key={d} className="flex items-center gap-3 text-dark-600">
                      <span className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary-600" />
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. DRONE EFFECT */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-dark-800 to-dark-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-600/20 border border-primary-500/30 mb-8"
              >
                <Users className="w-10 h-10 text-primary-400" />
              </motion.div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-heading leading-tight">
                Un moment convivial avec votre client,<br />
                <span className="text-primary-400">un outil de conversion imparable</span>
              </h2>
              <p className="text-dark-200 text-lg leading-relaxed max-w-3xl mx-auto">
                Le vol drone n&apos;est pas qu&apos;un relevé technique — c&apos;est un vrai moment d&apos;échange avec votre client. 
                Ensemble, vous survolez le chantier, vous commentez les zones sensibles, et vous projetez les solutions. 
                Le client repart avec une vision claire et la certitude d&apos;avoir choisi le bon professionnel. 
                Résultat : un taux de transformation imbattable.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* 6. CTA FINAL + SOCIAL PROOF */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { to: 1250, suffix: "+", label: "Projets traités" },
              { to: 340, suffix: "+", label: "Artisans actifs" },
              { to: 450, suffix: "K€", label: "Économisés pour nos clients" },
            ].map((stat) => (
              <FadeInSection key={stat.label}>
                <div className="text-center p-8 rounded-2xl bg-dark-50 border border-dark-100">
                  <div className="text-5xl font-bold text-primary-600 mb-2 font-heading">
                    <AnimatedCounter to={stat.to} suffix={stat.suffix} />
                  </div>
                  <p className="text-dark-500 font-medium">{stat.label}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
          <FadeInSection>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-dark-800 mb-6 font-heading">
                Prêt à révolutionner votre façon de travailler ?
              </h2>
              <p className="text-dark-500 text-lg mb-10">
                Créez votre compte en 2 minutes. Aucune carte bancaire requise pour essayer.
              </p>
              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-lg transition-all shadow-xl shadow-primary-600/25 hover:shadow-primary-500/40"
              >
                Créer un compte gratuit
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
