"use client";

import Link from "next/link";
import {
  Play,
  Clock,
  Camera,
  Map,
  Move3d,
  Ruler,
  Sun,
  FileText,
  ArrowRight,
} from "lucide-react";

const tutorials = [
  {
    id: "capture-basics",
    title: "Les bases de la captation photo",
    description: "Apprenez les fondamentaux pour capturer des photos exploitables : recouvrement, angles, conditions de lumière.",
    duration: "12:30",
    category: "capture",
    icon: Camera,
    level: "Débutant",
  },
  {
    id: "capture-advanced",
    title: "Captation avancée : toitures complexes",
    description: "Techniques pour les toitures à géométrie complexe, multi-pans, et zones masquées.",
    duration: "18:45",
    category: "capture",
    icon: Camera,
    level: "Avancé",
  },
  {
    id: "mission-planner-basics",
    title: "Utiliser le Mission Planner",
    description: "Guide complet pour planifier vos missions de vol avec notre outil Leaflet intégré.",
    duration: "15:20",
    category: "mission-planning",
    icon: Map,
    level: "Débutant",
  },
  {
    id: "mission-planner-advanced",
    title: "Optimiser votre mission de vol",
    description: "Paramètres avancés : recouvrement optimal, altitude, vitesse, déclencheur photo.",
    duration: "14:10",
    category: "mission-planning",
    icon: Map,
    level: "Avancé",
  },
  {
    id: "model-viewer",
    title: "Exploiter le visualiseur 3D",
    description: "Navigation, mesures, import d'objets 3D, et bascule entre vue 3D et DSM.",
    duration: "10:15",
    category: "analysis",
    icon: Move3d,
    level: "Débutant",
  },
  {
    id: "solar-analysis",
    title: "Analyse d'irradiation solaire",
    description: "Interprétez les cartes d'irradiation et d'ombrage générées par GrassGIS pour optimiser vos projets.",
    duration: "20:00",
    category: "analysis",
    icon: Sun,
    level: "Avancé",
  },
  {
    id: "measurements",
    title: "Mesures précises et calepinage",
    description: "Prenez des mesures, calepinez des panneaux solaires et implantez des objets 3D.",
    duration: "16:30",
    category: "analysis",
    icon: Ruler,
    level: "Intermédiaire",
  },
  {
    id: "reports",
    title: "Générer des rapports professionnels",
    description: "Créez des rapports détaillés pour vos devis : mesures, production solaire, implantation.",
    duration: "13:45",
    category: "analysis",
    icon: FileText,
    level: "Intermédiaire",
  },
  {
    id: "getting-started",
    title: "Bien démarrer avec AltiMetrix",
    description: "Premier pas : création de compte, premier projet, premier modèle 3D.",
    duration: "8:00",
    category: "getting-started",
    icon: Play,
    level: "Débutant",
  },
];

const categories = [
  { id: "all", label: "Tous" },
  { id: "getting-started", label: "Démarrage" },
  { id: "capture", label: "Captation" },
  { id: "mission-planning", label: "Mission Planner" },
  { id: "analysis", label: "Analyses" },
];

export default function TutorialsPage() {
  return (
    <>
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Tutoriels <span className="text-gradient">Vidéo</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Apprenez à capturer les photos parfaites, utiliser le Mission Planner
            et exploiter toutes les fonctionnalités d&apos;AltiMetrix.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                  cat.id === "all"
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-anthracite-800/50 text-gray-400 border border-anthracite-700 hover:border-anthracite-600 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="group bg-anthracite-800/30 border border-anthracite-700 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="relative aspect-video bg-gradient-to-br from-anthracite-700 to-anthracite-900 flex items-center justify-center">
                  <tutorial.icon className="w-12 h-12 text-cyan-400/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-cyan-500/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 bg-anthracite-900/80 rounded-lg text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tutorial.duration}
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-anthracite-900/80 rounded-lg text-xs text-cyan-400">
                    {tutorial.level}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {tutorial.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Accédez à tous les <span className="text-gradient">tutoriels</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Créez un compte gratuit pour accéder à l&apos;intégralité des tutoriels
            et commencer vos projets
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Créer mon compte gratuit
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 border border-anthracite-600 text-gray-300 font-medium rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
            >
              Essayer la démo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
