"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Ruler,
  Sun,
  FileText,
  Map,
  Video,
  Shield,
  Clock,
  Sparkles,
  TrendingUp,
  Globe,
  ChevronRight,
  Play,
  Move3d,
  Camera,
  Users,
} from "lucide-react";

const services = [
  {
    icon: Move3d,
    title: "Photogrammétrie 3D",
    description: "Transformez vos photos en modèles 3D précis avec une résolution centimétrique.",
    href: "/services#photogrammetrie",
  },
  {
    icon: Ruler,
    title: "Mesures & Calepinage",
    description: "Prenez des mesures, implantez des objets 3D (panneaux, piscines, abris) sur votre modèle.",
    href: "/services#mesures",
  },
  {
    icon: Sun,
    title: "Analyse Solaire",
    description: "Cartographie d'irradiation et d'ombrage pour optimiser vos installations solaires.",
    href: "/services#solaire",
  },
  {
    icon: FileText,
    title: "Rapports & Devis",
    description: "Générez des rapports professionnels à intégrer dans vos devis. Argumentez avec des données précises.",
    href: "/services#devis",
  },
  {
    icon: Map,
    title: "Mission Planner",
    description: "Planifiez vos vols de captation avec notre outil cartographique Leaflet.",
    href: "/mission-planner",
  },
  {
    icon: Video,
    title: "Tutoriels Vidéo",
    description: "Apprenez à capter les photos parfaites pour des modèles 3D exceptionnels.",
    href: "/tutorials",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Sécurité",
    desc: "Ne montez plus sur les toits. Toutes les mesures depuis le sol.",
  },
  {
    icon: Clock,
    title: "Gain de temps",
    desc: "Plus de retour sur chantier pour une mesure oubliée. Disponible 24/7.",
  },
  {
    icon: Sparkles,
    title: "Effet Waow",
    desc: "Impressionnez vos clients avec des visuels 3D. Devis signés garantis.",
  },
  {
    icon: TrendingUp,
    title: "Conversion",
    desc: "+35% de transformation des devis en commandes grâce à la visualisation 3D.",
  },
];

const stats = [
  { value: "10 cm", label: "Précision" },
  { value: "48 h", label: "Livraison" },
  { value: "-70%", label: "Temps devis" },
  { value: "+35%", label: "Conversion" },
];

const testimonials = [
  {
    name: "Jean-Pierre L.",
    company: "Couvreur, Lyon",
    text: "Je ne retourne plus jamais sur un chantier pour une mesure oubliée. Mes clients sont bluffés par la 3D, et mon taux de signature a explosé.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    company: "Installatrice solaire, Bordeaux",
    text: "L'analyse solaire AltiMetrix me permet de proposer des devis ultra-précis avec simulation de production. Mes clients comprennent immédiatement la valeur.",
    rating: 5,
  },
  {
    name: "Thomas M.",
    company: "Particulier, Paris",
    text: "J'ai pu vérifier le devis de toiture de 8000€ grâce aux mesures précises d'AltiMetrix. Économie : mon couvreur avait surévalué de 15%.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-anthracite-900 to-anthracite-900" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm">
                <Camera className="w-4 h-4" />
                Photogrammétrie par drone nouvelle génération
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Transformez vos{" "}
                <span className="text-gradient">photos aériennes</span>
                <br />
                en décisions rentables
              </h1>
              <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                AltiMetrix convertit vos photos drone en modèles 3D, mesures précises et
                analyses solaires. Sécurisez vos devis, gagnez du temps et impressionnez vos clients.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  Commencer maintenant
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-anthracette-600 text-gray-300 font-medium rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                >
                  <Play className="w-4 h-4" />
                  Voir la démo
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Captation par vos soins
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Livraison 48h
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Sans abonnement possible
                </div>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 gradient-cyan rounded-3xl opacity-20 blur-2xl" />
                <div className="relative w-full h-full bg-gradient-to-br from-anthracite-800 to-anthracite-900 rounded-3xl border border-anthracite-700 p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 gradient-cyan rounded-2xl flex items-center justify-center animate-float">
                      <Move3d className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-2xl font-bold mb-2">Modèle 3D Interactif</p>
                    <p className="text-gray-400 mb-6">Tournez, zoomez, mesurez</p>
                    <Link
                      href="/demo"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Essayer la démo <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-anthracite-900 to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-anthracite-800/80 backdrop-blur-sm border border-anthracite-700 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comment ça <span className="text-gradient">marche</span>
            </h2>
            <p className="text-gray-400">
              Trois étapes simples pour transformer vos photos en modèles 3D exploitables
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Capturez les photos",
                desc: "Suivez nos tutoriels vidéo pour capturer les photos avec votre drone. Notre Mission Planner vous guide pour une couverture optimale.",
                icon: Camera,
              },
              {
                step: "02",
                title: "Chargez sur la plateforme",
                desc: "Déposez vos photos sur votre espace client. Nos serveurs lancent automatiquement le pipeline de traitement.",
                icon: Globe,
              },
              {
                step: "03",
                title: "Exploitez vos modèles",
                desc: "Recevez vos modèles 3D, mesures et rapports en 48h. Visualisez, mesurez, calepinez, et importez dans vos devis.",
                icon: Users,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative group p-8 bg-anthracite-800/50 border border-anthracite-700 rounded-2xl hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="text-4xl font-bold text-cyan-500/20 mb-4">
                  {item.step}
                </div>
                <div className="w-12 h-12 gradient-cyan rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-anthracite-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Services <span className="text-gradient">AltiMetrix</span>
            </h2>
            <p className="text-gray-400">
              Une gamme complète d&apos;outils pour les artisans et particuliers
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group p-6 bg-anthracite-800/30 border border-anthracite-700 rounded-xl hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="w-10 h-10 gradient-cyan rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <service.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Pourquoi choisir <span className="text-gradient">AltiMetrix</span>
            </h2>
            <p className="text-gray-400">
              Des avantages concrets pour votre activité
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="p-6 bg-anthracite-800/30 border border-anthracite-700 rounded-xl text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 gradient-cyan rounded-xl flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-anthracite-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ils nous <span className="text-gradient">font confiance</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="p-6 bg-anthracite-800/50 border border-anthracite-700 rounded-xl"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-anthracite-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à transformer votre <span className="text-gradient">façon de travailler</span> ?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Rejoignez les artisans et professionnels qui utilisent AltiMetrix pour
            gagner du temps, sécuriser leurs devis et impressionner leurs clients.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25 text-lg"
            >
              Créer mon compte gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 border border-anthracite-600 text-gray-300 font-medium rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-lg"
            >
              Voir les tarifs
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Sans engagement. Tutoriels gratuits inclus. {
            " "}Annulation à tout moment.
          </p>
        </div>
      </section>
    </>
  );
}
