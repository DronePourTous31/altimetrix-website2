"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Zap, Sun, Briefcase, Sparkles,
  ChevronRight, Plus, Star, Home,
  ArrowRight, Clock, Search, Lock, Gift,
  HardHat, Layers, MapPin, TreePine,
  Camera, Box
} from "lucide-react";

type Billing = "monthly" | "yearly";
type Segment = "couvreurs" | "solaire" | "particuliers" | "comparatif";

const yearlyDiscount = 0.17;

// ─── SEGMENT LABELS ──────────────────────────
const segments: { id: Segment; label: string; icon: React.ElementType }[] = [
  { id: "couvreurs",    label: "Couvreurs & Paysagistes", icon: HardHat },
  { id: "solaire",      label: "Installateurs solaire",    icon: Sun },
  { id: "particuliers", label: "Particuliers",             icon: Home },
  { id: "comparatif",   label: "Comparatif",               icon: Layers },
];

// ─── PLANS ───────────────────────────────────
interface PlanFeature { text: string; included: boolean; star?: boolean }
interface Plan {
  name: string; tag: string; tagColor: string; desc: string;
  monthly?: number; oneShot?: number; projects: string; subText?: string;
  features: PlanFeature[]; popular?: boolean; cta: string; ctaVariant?: "primary" | "ghost";
}

const couvreurPlans: Plan[] = [
  {
    name: "Decouverte", tag: "One shot", tagColor: "neutral",
    desc: "Testez AltiMetrix sur un seul chantier. Ideal pour decouvrir la puissance du modele 3D sans engagement.",
    oneShot: 149, projects: "1 projet - livraison sous 48h",
    features: [
      { text: "Modele 3D photorealiste", included: true },
      { text: "Orthophoto 2D + MNS", included: true },
      { text: "Mesures (surfaces, distances, pentes)", included: true },
      { text: "Rapport PDF professionnel", included: true },
      { text: "Mission planner Leaflet inclus", included: true },
      { text: "Calepinage solaire", included: false },
      { text: "Implantation 3D d'objets", included: false },
    ],
    cta: "Commander", ctaVariant: "ghost",
  },
  {
    name: "Starter Mesures", tag: "Populaire - Lancement", tagColor: "cyan",
    desc: "L'abonnement ideal pour professionnaliser vos devis et gagner du temps sur chaque chantier.",
    monthly: 49, projects: "3 projets/mois", subText: "soit 16EUR/projet",
    popular: true,
    features: [
      { text: "Modele 3D + Ortho 2D + MNS", included: true, star: true },
      { text: "Mesures completes (surfaces, pentes, lineaires)", included: true, star: true },
      { text: "Rapport PDF automatise par projet", included: true, star: true },
      { text: "Mission planner Leaflet", included: true },
      { text: "Archivage modeles 6 mois", included: true },
      { text: "Verification qualite photos incluse", included: true },
      { text: "Support email", included: true },
      { text: "Calepinage solaire", included: false },
    ],
    cta: "Demarrer - 1 mois offert", ctaVariant: "primary",
  },
  {
    name: "Starter Pro", tag: "Volume", tagColor: "neutral",
    desc: "Pour les artisans actifs avec plusieurs chantiers par semaine. Traitement prioritaire et export CAO.",
    monthly: 119, projects: "10 projets/mois", subText: "soit 12EUR/projet",
    features: [
      { text: "Tout le Starter Mesures x10", included: true, star: true },
      { text: "Projets supp. a 15EUR/projet", included: true, star: true },
      { text: "Archivage 12 mois", included: true },
      { text: "Traitement prioritaire <12h", included: true },
      { text: "Support telephonique weekend", included: true },
      { text: "Export CAO (DXF/DWG)", included: true },
      { text: "Tableau de bord multi-projets", included: true },
      { text: "Calepinage solaire", included: false },
    ],
    cta: "Choisir Starter Pro", ctaVariant: "ghost",
  },
];

const solairePlans: Plan[] = [
  {
    name: "Solar Pro", tag: "Exclusif - Aucun concurrent", tagColor: "gold",
    desc: "Du modele 3D de la toiture jusqu'au rapport de production solaire - en une seule commande.",
    monthly: 79, projects: "3 projets/mois", subText: "soit 26EUR/projet",
    popular: true,
    features: [
      { text: "Tout le Starter Mesures inclus", included: true, star: true },
      { text: "Calepinage panneaux PV en 3D", included: true, star: true },
      { text: "Analyse irradiation solaire (GRASS GIS)", included: true, star: true },
      { text: "Analyse ombrage dynamique (saisons)", included: true, star: true },
      { text: "Calcul production estimee dans le rapport", included: true, star: true },
      { text: "Vue 2D DSM pour analyse d'exposition", included: true },
      { text: "Mission planner Leaflet inclus", included: true },
      { text: "Rapport client complet", included: true },
    ],
    cta: "Demarrer Solar Pro", ctaVariant: "primary",
  },
  {
    name: "Solar Pro+", tag: "Volume", tagColor: "gold",
    desc: "Pour les installateurs avec un flux regulier. Traitement prioritaire et exports avances.",
    monthly: 189, projects: "10 projets/mois", subText: "soit 19EUR/projet",
    features: [
      { text: "Tout Solar Pro x10", included: true, star: true },
      { text: "Projets supp. a 22EUR/projet", included: true, star: true },
      { text: "Traitement prioritaire <12h", included: true },
      { text: "Export donnees solaires CSV/JSON", included: true },
      { text: "Archivage 12 mois", included: true },
      { text: "Support telephonique weekend", included: true },
      { text: "Tableau de bord multi-projets", included: true },
    ],
    cta: "Choisir Solar Pro+", ctaVariant: "ghost",
  },
];

const particulierPlans: Plan[] = [
  {
    name: "Rapport Standard", tag: "Verification", tagColor: "neutral",
    desc: "Verifiez un devis de toiture ou de renovation. Obtenez les vrais metres de votre bien.",
    oneShot: 99, projects: "1 rapport complet - livraison 48h",
    features: [
      { text: "Modele 3D de votre toiture / terrain", included: true },
      { text: "Metres precis : surface, pentes, lineaires", included: true },
      { text: "Comparatif devis vs metres reels", included: true },
      { text: "Rapport PDF professionnel", included: true },
      { text: "Tutoriel photos inclus", included: true },
      { text: "Analyse solaire / calepinage PV", included: false },
      { text: "Implantation 3D piscine ou abris", included: false },
    ],
    cta: "Commander mon rapport", ctaVariant: "ghost",
  },
  {
    name: "Rapport Premium", tag: "Recommande", tagColor: "cyan",
    desc: "Verification du devis + visualisation de votre projet solaire ou piscine en 3D sur votre terrain reel.",
    oneShot: 179, projects: "1 rapport complet - livraison 48h",
    popular: true,
    features: [
      { text: "Tout le Rapport Standard", included: true, star: true },
      { text: "Calepinage PV 3D sur votre toiture reelle", included: true, star: true },
      { text: "OU implantation 3D piscine / abri / terrasse", included: true, star: true },
      { text: "Analyse irradiation et ombrage (option solaire)", included: true, star: true },
      { text: "Estimation production solaire annuelle", included: true, star: true },
      { text: "Rapport enrichi avec visualisations 3D", included: true },
      { text: "Acces modele 3D interactif 3 mois", included: true },
    ],
    cta: "Commander mon rapport Premium", ctaVariant: "primary",
  },
];

const addons = [
  { icon: Camera,    name: "Captation terrain AltiMetrix",      desc: "Je me deplace et realise moi-meme le vol drone.", price: "+150EUR", note: "/ intervention (weekend, local)" },
  { icon: Search,    name: "Inspection toiture + rapport",      desc: "Identification zones degradees, mousses, fissures.", price: "+49EUR", note: "/ projet (sur forfait existant)" },
  { icon: Box,       name: "Calcul de volume (stockpile)",      desc: "Volumes de materiaux (gravieres, remblais) a partir du MNS.", price: "+39EUR", note: "/ projet" },
  { icon: TreePine,  name: "Sante vegetale (NDVI)",             desc: "Analyse sanitaire espaces verts, golfs ou cultures.", price: "Sur devis", note: "/ selon surface" },
  { icon: MapPin,    name: "Etude de niveaux",                  desc: "Courbes de niveau, profils en long, calcul de pente.", price: "+39EUR", note: "/ projet" },
  { icon: Camera,    name: "Photos & video immobilier",         desc: "Prises de vues aeriennes pour particuliers ou agences.", price: "Sur devis", note: "" },
];

const guarantees = [
  { icon: Clock,   title: "Livraison sous 24-48h",      text: "Modeles et rapports disponibles sous 24h apres validation des photos." },
  { icon: Search,  title: "Controle qualite photos",     text: "Chaque jeu de photos est verifie avant traitement. Si insuffisant, vous etes recontacte sans frais." },
  { icon: Lock,    title: "Sans engagement an 1",        text: "Resiliez a tout moment. Aucuns frais caches. L'annuel est une option." },
  { icon: Gift,    title: "1er mois offert",             text: "Pour tout abonnement pendant la periode de lancement." },
];

const faq = [
  { q: "Quel drone faut-il pour utiliser AltiMetrix ?",
    a: "La grande majorite des drones grand public conviennent : DJI Mini 2/3/4, DJI Air 2S, DJI Mavic 3, Autel EVO... L'important est de realiser un plan de vol en grille avec un recouvrement de 75-80%. Nos tutoriels video et le mission planner Leaflet vous guident pas a pas. Pas de drone ? Nous proposons une option captation terrain (+150EUR)." },
  { q: "Quelle est la precision des modeles generes ?",
    a: "Avec un drone standard (sans RTK), la precision relative est de 1 a 3 cm - suffisant pour des metres de toiture, calepinages PV et implantations piscine. Pour une precision centimetrique absolue (cadastre, geometre), contactez-nous pour un devis avec drone RTK." },
  { q: "Que se passe-t-il si mes photos ne sont pas exploitables ?",
    a: "Chaque projet passe par un controle qualite avant traitement. Si vos photos sont insuffisantes, vous etes prevenu sous 4h avec un rapport et des conseils pour refaire la captation - sans frais. Le projet n'est debite que lorsque le modele est valide." },
  { q: "La reglementation DGAC s'applique-t-elle a mes vols ?",
    a: "Oui. En tant que pilote, vous devez etre enregistre sur alphaTango et respecter les zones de vol. Pour des vols residentiels en zone degagee (S1/S2), c'est simple et gratuit. Nos tutoriels incluent un guide reglementaire et le mission planner indique les zones reglementees en temps reel." },
  { q: "Les projets non utilises dans le mois sont-ils reportes ?",
    a: "Non, les projets inclus sont renouveles chaque mois et ne s'accumulent pas. En revanche, vous pouvez commander des projets supplementaires a la carte (19EUR Starter, 22EUR Solar Pro) sans changer de forfait." },
];

const comparisonRows = [
  { label: "Projets inclus", values: ["1", "3/mois", "10/mois", "3/mois", "10/mois", "1"] },
  { label: "Modele 3D photorealiste", values: ["oui", "oui", "oui", "oui", "oui", "oui"] },
  { label: "Ortho 2D + MNS", values: ["oui", "oui", "oui", "oui", "oui", "oui"] },
  { label: "Mesures completes", values: ["oui", "oui", "oui", "oui", "oui", "oui"] },
  { label: "Rapport PDF automatise", values: ["oui", "oui", "oui", "oui", "oui", "oui"] },
  { label: "Mission planner Leaflet", values: ["oui", "oui", "oui", "oui", "oui", "non"] },
  { label: "Calepinage panneaux PV 3D", values: ["non", "non", "non", "star", "star", "premium"] },
  { label: "Analyse irradiation GRASS GIS", values: ["non", "non", "non", "star", "star", "premium"] },
  { label: "Analyse ombrage dynamique", values: ["non", "non", "non", "star", "star", "premium"] },
  { label: "Implantation 3D objets", values: ["non", "non", "non", "non", "non", "premium"] },
  { label: "Export CAO DXF/DWG", values: ["non", "non", "oui", "non", "oui", "non"] },
  { label: "Traitement prioritaire <12h", values: ["non", "non", "oui", "non", "oui", "non"] },
  { label: "Archivage modeles", values: ["3 mois", "6 mois", "12 mois", "6 mois", "12 mois", "3 mois"] },
  { label: "Reduction annuel", values: ["--", "-17%", "-17%", "-17%", "-17%", "--"] },
];

const comparisonHeaders = [
  "Decouverte\n149EUR", "Starter\n49EUR/mois", "Starter Pro\n119EUR/mois",
  "Solar Pro\n79EUR/mois", "Solar Pro+\n189EUR/mois", "Particulier\n99-179EUR"
];

function PlanCard({ plan, billing, highlight }: { plan: Plan; billing: Billing; highlight?: boolean }) {
  const price = plan.oneShot ?? (billing === "yearly" && plan.monthly
    ? Math.round(plan.monthly * (1 - yearlyDiscount))
    : plan.monthly);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={`rounded-2xl p-6 sm:p-8 border-2 transition-all flex flex-col relative ${
        plan.popular
          ? "border-primary-500 bg-primary-50/50 shadow-xl scale-[1.02] sm:scale-105"
          : "border-dark-100 hover:border-primary-200 bg-white"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary-600 text-white text-xs font-bold shadow-lg whitespace-nowrap">
          Recommande
        </span>
      )}

      <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-4 w-fit ${
        plan.tagColor === "cyan" ? "bg-primary-100 text-primary-700" :
        plan.tagColor === "gold" ? "bg-yellow-100 text-yellow-800" :
        "bg-dark-100 text-dark-500"
      }`}>
        {plan.tag}
      </span>

      <h3 className="text-lg font-bold text-dark-800 font-heading mb-1">{plan.name}</h3>
      <p className="text-dark-500 text-sm mb-4 leading-relaxed">{plan.desc}</p>

      <div className="mb-4">
        <span className="text-4xl font-bold text-dark-800">{price}</span>
        <span className="text-dark-500 text-sm ml-1">
          {plan.oneShot ? "EUR HT - projet unique" : "EUR/mois HT"}
        </span>
        {plan.monthly && billing === "yearly" && (
          <span className="block text-xs text-primary-600 mt-1 font-medium">
            {plan.monthly * 12}EUR/an (economisez {Math.round(plan.monthly * 12 * yearlyDiscount)}EUR)
          </span>
        )}
      </div>

      <p className="text-sm text-primary-600 font-medium mb-4">
        {plan.projects}
        {plan.subText && <span className="text-dark-400 font-normal"> - {plan.subText}</span>}
      </p>

      <hr className="border-dark-100 mb-4" />

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            {f.included ? (
              f.star ? (
                <Star className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              ) : (
                <Check className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              )
            ) : (
              <X className="w-4 h-4 text-dark-300 shrink-0 mt-0.5" />
            )}
            <span className={f.included ? "text-dark-700" : "text-dark-400"}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={`/auth/register?plan=${plan.name.toLowerCase().replace(/\s+/g, "-")}&billing=${billing}`}
        className={`block w-full text-center py-3.5 rounded-xl font-semibold transition-all text-sm ${
          plan.popular
            ? "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/25"
            : "bg-dark-700 hover:bg-dark-600 text-white"
        }`}
      >
        {plan.cta}
      </Link>
    </motion.div>
  );
}

function ComparisonCell({ value }: { value: string }) {
  if (value === "oui") return <Check className="w-4 h-4 text-primary-500" />;
  if (value === "non") return <X className="w-4 h-4 text-dark-300" />;
  if (value === "star") return <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
  if (value === "premium") return <span className="text-xs font-semibold text-primary-600">Premium</span>;
  return <span className="text-sm text-dark-700">{value}</span>;
}

function FAQItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={`border-b border-dark-100 ${open ? "pb-4" : ""}`}>
      <button onClick={onToggle} className="w-full flex justify-between items-center gap-4 py-4 text-left">
        <span className="text-sm font-medium text-dark-800">{q}</span>
        <Plus className={`w-4 h-4 text-dark-400 shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
        <p className="text-sm text-dark-500 leading-relaxed pr-8">{a}</p>
      </div>
    </div>
  );
}

export default function TarifsPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [segment, setSegment] = useState<Segment>("couvreurs");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ─── HERO ─────────────────────────── */}
      <section className="bg-gradient-to-br from-dark-800 to-dark-900 text-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/20 text-primary-300 text-sm font-medium mb-5 border border-primary-500/30">
            <Sparkles className="w-4 h-4" /> Photogrammetrie drone - SaaS artisans & particuliers
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold mb-4 font-heading">
            Des modeles 3D professionnels <br className="hidden sm:block" /><span className="text-primary-400">a partir de vos photos</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-dark-200 max-w-2xl mx-auto text-lg">
            Vous captez les photos, notre pipeline automatise genere vos modeles 3D, analyses et rapports - livres sous 24h.
          </motion.p>

          {/* Toggle mensuel/annuel */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 bg-dark-700/50 rounded-full p-1.5 mt-8">
            <button onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === "monthly" ? "bg-white text-dark-800 shadow-sm" : "text-dark-300 hover:text-white"
              }`}>Mensuel</button>
            <button onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === "yearly" ? "bg-white text-dark-800 shadow-sm" : "text-dark-300 hover:text-white"
              }`}>Annuel <span className="text-primary-400 text-xs ml-1">-17%</span></button>
          </motion.div>
        </div>
      </section>

      {/* ─── SEGMENT TABS ──────────────────── */}
      <section className="bg-white border-b border-dark-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1.5 py-3 overflow-x-auto scrollbar-hide justify-center">
            {segments.map((seg) => (
              <button key={seg.id} onClick={() => setSegment(seg.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  segment === seg.id
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-dark-500 hover:text-dark-700 hover:bg-dark-50"
                }`}>
                <seg.icon className="w-4 h-4" />
                {seg.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION COUVREURS ═══ */}
      <AnimatePresence mode="wait">
      {segment === "couvreurs" && (
        <motion.div key="couvreurs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <section className="py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
                  Couvreurs - Nettoyeurs toiture - Paysagistes - Installateurs piscine
                </span>
                <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">Fini le metre <span className="text-primary-600">sur le toit</span></h2>
                <p className="text-dark-500 max-w-2xl mx-auto">Mesures precises, rapports professionnels, implantation 3D - sans jamais monter en hauteur.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {couvreurPlans.map((plan) => (
                  <PlanCard key={plan.name} plan={plan} billing={billing} />
                ))}
              </div>

              {/* ROI */}
              <div className="max-w-5xl mx-auto mt-10 p-6 sm:p-8 rounded-2xl bg-dark-50 border border-dark-100 flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-dark-800 mb-2 font-heading">Le calcul est simple</h3>
                  <p className="text-sm text-dark-500 leading-relaxed">
                    Un devis toiture moyen = <strong className="text-dark-700">8 000-15 000EUR</strong>. Un rapport AltiMetrix professionnel augmente votre taux de conversion. 1 devis supplementaire signe = abonnement rembourse <strong className="text-primary-600">100x a 300x</strong>.
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  {[
                    { val: "0", lab: "montee sur toit" },
                    { val: "<24h", lab: "livraison modele" },
                    { val: "+-2%", lab: "precision metres" },
                  ].map((s) => (
                    <div key={s.val} className="bg-white rounded-xl px-4 py-3 text-center min-w-[80px] shadow-sm">
                      <div className="text-xl font-bold text-primary-600 font-heading">{s.val}</div>
                      <div className="text-[10px] text-dark-400 mt-0.5">{s.lab}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {/* ═══ SECTION SOLAIRE ═══ */}
      {segment === "solaire" && (
        <motion.div key="solaire" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <section className="py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-semibold mb-4">
                  Installateurs panneaux photovoltaiques residentiels
                </span>
                <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">L'etude solaire que vos concurrents <br className="hidden sm:block" /><span className="text-primary-600">ne peuvent pas faire</span></h2>
                <p className="text-dark-500 max-w-2xl mx-auto">Calepinage 3D sur la vraie toiture, irradiation GRASS GIS, ombrage dynamique - un dossier qui fait signer.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {solairePlans.map((plan) => (
                  <PlanCard key={plan.name} plan={plan} billing={billing} />
                ))}
              </div>

              {/* Concurrent comparison */}
              <div className="max-w-3xl mx-auto mt-10 p-6 sm:p-8 rounded-2xl bg-dark-50 border border-dark-100">
                <h3 className="text-sm font-bold text-yellow-600 mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Pourquoi Solar Pro est introuvable ailleurs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-sm text-dark-500 leading-relaxed">
                    <strong className="block text-dark-700 mb-1">AiroCollect / AirTeam</strong>
                    Mesures et modeles 3D uniquement. Aucune analyse solaire, aucun calepinage PV.
                  </div>
                  <div className="text-sm text-dark-500 leading-relaxed">
                    <strong className="block text-dark-700 mb-1">Reonic</strong>
                    Calepinage PV mais ne genere pas les modeles depuis vos photos drones. Pas de modele 3D reel.
                  </div>
                  <div className="text-sm text-dark-500 leading-relaxed p-3 rounded-xl bg-primary-50 border border-primary-100">
                    <strong className="block text-primary-700 mb-1">AltiMetrix Solar Pro</strong>
                    La seule plateforme qui part de vos photos pour livrer calepinage + irradiation + ombrage + production sur le meme modele 3D reel.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {/* ═══ SECTION PARTICULIERS ═══ */}
      {segment === "particuliers" && (
        <motion.div key="particuliers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <section className="py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-4">
                  Particuliers - Proprietaires
                </span>
                <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">Signez <span className="text-primary-600">en confiance</span>, pas a l'aveugle</h2>
                <p className="text-dark-500 max-w-2xl mx-auto">Avant de signer un devis de plusieurs milliers d'euros, verifiez que les surfaces et quantites correspondent a votre bien reel.</p>
              </div>

              {/* Banner */}
              <div className="max-w-3xl mx-auto mb-10 p-6 sm:p-8 rounded-2xl bg-primary-600 text-center">
                <span className="inline-block text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-dark-800 text-primary-400 mb-4">
                  Segment exclusif AltiMetrix
                </span>
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Votre maison merite une verification professionnelle</h3>
                <p className="text-sm text-primary-100 max-w-md mx-auto">Toiture, solaire, piscine, terrasse - obtenez les vrais metres pour comparer les devis et negocier en connaissance de cause.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {particulierPlans.map((plan) => (
                  <PlanCard key={plan.name} plan={plan} billing={billing} />
                ))}
              </div>

              {/* ROI */}
              <div className="max-w-2xl mx-auto mt-10 p-6 sm:p-8 rounded-2xl bg-primary-50 border border-primary-100 text-center">
                <h3 className="text-base font-bold text-dark-800 mb-5 font-heading">Ce que ca represente reellement</h3>
                <div className="flex gap-4 justify-center flex-wrap">
                  {[
                    { lab: "Devis toiture moyen", val: "12 000EUR", sub: "Rapport = 0,8% du devis" },
                    { lab: "Devis solaire moyen", val: "18 000EUR", sub: "Rapport Premium = 1% du devis" },
                    { lab: "Ecart moyen detecte", val: "+12%", sub: "sur les surfaces facturees" },
                  ].map((s) => (
                    <div key={s.lab} className="bg-white rounded-xl px-5 py-4 text-center min-w-[140px] shadow-sm">
                      <div className="text-[11px] text-dark-400 mb-1">{s.lab}</div>
                      <div className="text-2xl font-bold text-dark-800 font-heading">{s.val}</div>
                      <div className="text-[10px] text-dark-400 mt-1">{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      )}

      {/* ═══ SECTION COMPARATIF ═══ */}
      {segment === "comparatif" && (
        <motion.div key="comparatif" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <section className="py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-dark-100 text-dark-500 text-sm font-semibold mb-4">Vue d'ensemble</span>
                <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">Toutes les offres <span className="text-primary-600">en un coup d'oeil</span></h2>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-dark-100 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-100">
                      <th className="text-left p-3 sm:p-4 text-dark-500 font-semibold text-[11px] tracking-wider">Fonctionnalite</th>
                      {comparisonHeaders.map((h, i) => {
                        const isHL = i === 1 || i === 3;
                        return (
                          <th key={i} className={`p-3 sm:p-4 text-center text-[11px] font-semibold tracking-wider whitespace-pre-line leading-tight ${
                            isHL ? "bg-primary-600 text-white" : "bg-dark-50 text-dark-500"
                          }`}>{h}</th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={row.label} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                        <td className="p-3 sm:p-4 text-dark-700 font-medium text-xs sm:text-sm">{row.label}</td>
                        {row.values.map((v, j) => {
                          const isHL = j === 1 || j === 3;
                          return (
                            <td key={j} className={`p-3 sm:p-4 text-center ${
                              isHL ? "bg-primary-50/30" : ""
                            }`}>
                              <div className="flex justify-center">
                                <ComparisonCell value={v} />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </motion.div>
      )}
      </AnimatePresence>

      {/* ═══ ADDONS ═══ */}
      <section className="py-16 lg:py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-dark-100 text-dark-500 text-sm font-semibold mb-4">Options a la carte</span>
            <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">Prestations complementaires</h2>
            <p className="text-dark-500 max-w-2xl mx-auto">A ajouter sur n'importe quel forfait ou en commande independante.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {addons.map((a) => (
              <div key={a.name} className="flex items-start gap-4 p-5 rounded-xl bg-white border border-dark-100 hover:border-primary-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <a.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark-800 mb-1">{a.name}</h4>
                  <p className="text-xs text-dark-500 leading-relaxed mb-1.5">{a.desc}</p>
                  <p className="text-sm font-semibold text-primary-600">{a.price} <span className="text-[11px] text-dark-400 font-normal">{a.note}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GARANTIES ═══ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-dark-100 text-dark-500 text-sm font-semibold mb-4">Nos engagements</span>
            <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">Ce que vous pouvez compter sur nous</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {guarantees.map((g) => (
              <div key={g.title} className="flex items-start gap-4 p-5 rounded-xl bg-dark-50 border border-dark-100">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <g.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-dark-800 mb-1">{g.title}</h4>
                  <p className="text-xs text-dark-500 leading-relaxed">{g.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 lg:py-20 bg-dark-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-dark-100 text-dark-500 text-sm font-semibold mb-4">Questions frequentes</span>
            <h2 className="text-3xl font-bold text-dark-800 mb-3 font-heading">Tout ce que vous devez savoir</h2>
          </div>
          <div className="bg-white rounded-2xl border border-dark-100 px-6">
            {faq.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary-600 p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-heading">Pret a transformer vos chantiers ?</h2>
            <p className="text-primary-100 mb-8 max-w-md mx-auto">Commencez avec 1 mois offert. Aucun engagement. Vos premiers modeles livres sous 24h.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-semibold transition-colors shadow-lg">
                Creer mon compte gratuit <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-dark-800 text-dark-800 hover:bg-dark-800/10 font-semibold transition-colors">
                Voir un exemple de modele 3D
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER NOTE ═══ */}
      <footer className="bg-dark-50 border-t border-dark-100 py-6">
        <p className="text-center text-xs text-dark-400">
          <strong className="text-dark-600">AltiMetrix</strong> - Photogrammetrie drone pour artisans & particuliers - Tarifs HT - TVA en sus selon statut
        </p>
      </footer>
    </>
  );
}
