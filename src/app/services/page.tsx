"use client";

import Link from "next/link";
import {
  Move3d,
  Ruler,
  Sun,
  FileText,
  CheckCircle2,
  Shield,
  Clock,
  TrendingUp,
  ArrowRight,
  Camera,
} from "lucide-react";

const services = [
  {
    id: "photogrammetrie",
    icon: Move3d,
    title: "Photogrammétrie 3D",
    subtitle: "Transformez vos photos en modèles 3D précis",
    description:
      "Notre pipeline automatisé traite vos photos aériennes pour générer un modèle 3D texturé haute résolution, un DSM (Digital Surface Model) et une orthophoto géoréférencée. Le tout avec une précision centimétrique.",
    targets: ["Couvreurs", "Installateurs solaire", "Paysagistes", "Particuliers"],
    benefits: [
      "Modèle 3D texturé consultable en ligne",
      "DSM pour analyses topographiques",
      "Orthophoto haute résolution géoréférencée",
      "Nuage de points dense",
      "Précision centimétrique",
    ],
    image: null,
  },
  {
    id: "mesures",
    icon: Ruler,
    title: "Mesures & Calepinage 3D",
    subtitle: "Toutes vos mesures depuis votre bureau",
    description:
      "Plus besoin de retourner sur le chantier. Mesurez distances, surfaces et volumes directement sur le modèle 3D. Implantez des objets 3D (panneaux solaires, piscines, abris de jardin) pour visualiser votre projet en situation réelle.",
    targets: ["Couvreurs", "Installateurs solaire", "Pisciniers", "Paysagistes", "Particuliers"],
    benefits: [
      "Mesures de distances, surfaces, volumes",
      "Calepinage précis de panneaux solaires",
      "Implantation d'objets 3D (piscines, abris)",
      "Export des mesures en PDF pour vos devis",
      "Visualisation réaliste du projet fini",
    ],
    image: null,
  },
  {
    id: "solaire",
    icon: Sun,
    title: "Analyse Solaire",
    subtitle: "Irradiation et ombrage pour vos projets photovoltaïques",
    description:
      "Réalisez des analyses d'irradiation solaire et d'ombrage poussées sous GrassGIS. Optimisez le placement des panneaux et fournissez des rapports de production détaillés qui rassurent vos clients et accélèrent leur décision.",
    targets: ["Installateurs solaire", "Bureaux d'études"],
    benefits: [
      "Carte d'irradiation solaire annuelle",
      "Analyse d'ombrage dynamique heure par heure",
      "Calepinage optimal des panneaux",
      "Estimation de production (kWh/an)",
      "Rapport client personnalisé avec ROI",
    ],
    image: null,
  },
  {
    id: "devis",
    icon: FileText,
    title: "Rapports & Devis",
    subtitle: "Des rapports professionnels pour convaincre",
    description:
      "Générez des rapports détaillés et personnalisés à intégrer dans vos devis. Mesures, calepinage, production solaire, implantation piscine… Tous les éléments pour justifier votre proposition et augmenter votre taux de conversion.",
    targets: ["Tous les artisans", "Particuliers", "Agences immobilières"],
    benefits: [
      "Rapport de mesures détaillé avec photos",
      "Rapport d'inspection de toiture",
      "Rapport de production solaire",
      "Rapport d'implantation 3D",
      "Export PDF personnalisé avec votre logo",
    ],
    image: null,
  },
  {
    id: "inspection",
    icon: Shield,
    title: "Inspection de Toiture",
    subtitle: "Diagnostic complet sans monter sur le toit",
    description:
      "Service complémentaire d'inspection de toiture par drone. Rapport détaillé avec détection de défauts, zones d'usure, et recommandations. Idéal pour les couvreurs et les particuliers souhaitant vérifier l'état de leur toiture.",
    targets: ["Couvreurs", "Particuliers", "Assureurs", "Agences immobilières"],
    benefits: [
      "Rapport d'inspection détaillé",
      "Détection de défauts et zones d'usure",
      "Photos haute résolution annotées",
      "Recommandations et priorités",
      "Idéal pour devis de rénovation",
    ],
    image: null,
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Vous capturez les photos",
    desc: "Suivez nos tutoriels ou utilisez le Mission Planner pour un vol parfait.",
    icon: Camera,
  },
  {
    step: 2,
    title: "Vous chargez sur la plateforme",
    desc: "Déposez vos photos dans votre espace client. Notre pipeline s'occupe du reste.",
    icon: Globe,
  },
  {
    step: 3,
    title: "Nous traitons automatiquement",
    desc: "Nos algorithmes génèrent les modèles 3D et réalisent les analyses en moins de 48h.",
    icon: Clock,
  },
  {
    step: 4,
    title: "Vous exploitez les résultats",
    desc: "Accédez à vos modèles, outils et rapports depuis votre dashboard. Intégrez-les dans vos devis.",
    icon: TrendingUp,
  },
];

function Globe({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Nos <span className="text-gradient">Services</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Une gamme complète d&apos;outils de photogrammétrie pour les artisans,
            professionnels et particuliers
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {services.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className="scroll-mt-24 grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="w-14 h-14 gradient-cyan rounded-2xl flex items-center justify-center mb-6">
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">{service.title}</h2>
                <p className="text-cyan-400 mb-4">{service.subtitle}</p>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.targets.map((target) => (
                    <span
                      key={target}
                      className="px-3 py-1.5 bg-anthracite-800 border border-anthracite-700 rounded-lg text-xs text-gray-300"
                    >
                      {target}
                    </span>
                  ))}
                </div>
                <ul className="space-y-3">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`relative ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="aspect-video bg-gradient-to-br from-anthracite-800 to-anthracite-900 rounded-2xl border border-anthracite-700 flex items-center justify-center p-8">
                  <div className="text-center">
                    <service.icon className="w-16 h-16 text-cyan-400/40 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Visualisation interactive disponible dans la démo</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-anthracite-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comment ça <span className="text-gradient">marche</span>
            </h2>
            <p className="text-gray-400">
              Un processus simple et automatisé
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 gradient-cyan rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                  {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à <span className="text-gradient">essayer</span> ?
          </h2>
          <p className="text-gray-400 mb-8">
            Créez votre compte et accédez à tous nos tutoriels gratuitement
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
