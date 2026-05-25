"use client";

import Link from "next/link";
import {
  Lock,
  Crosshair,
  Navigation,
  Layers,
  Camera,
  Info,
  Maximize2,
  ArrowRight,
} from "lucide-react";

export default function MissionPlannerPage() {
  return (
    <>
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Mission <span className="text-gradient">Planner</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Planifiez vos vols de captation avec notre outil cartographique.
            Définissez la zone, optimisez la trajectoire, et garantissez
            une couverture parfaite pour vos modèles 3D.
          </p>
        </div>
      </section>

      <section className="pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-cyan-400 font-medium text-sm sm:text-base">
                Démonstrateur libre d&apos;accès. La version complète avec historique des missions est réservée aux clients abonnés.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-anthracite-800 border border-anthracite-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-anthracite-700 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">Mission Planner AltiMetrix</span>
              </div>
              <a
                href="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/MISSION_PLANNER/altimetrix_planner_v3d.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-white border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all"
              >
                Ouvrir en plein écran
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="relative w-full" style={{ height: "75vh", minHeight: "500px" }}>
              <iframe
                src="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/MISSION_PLANNER/altimetrix_planner_v3d.html"
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
                title="Mission Planner AltiMetrix"
                allow="fullscreen; geolocation"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">
              Fonctionnalités du <span className="text-gradient">Mission Planner</span>
            </h2>
            <p className="text-gray-400">
              Tout ce que vous pouvez faire avec notre outil de planification
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Crosshair,
                title: "Définition de zone",
                desc: "Tracez la zone à couvrir directement sur la carte. Le plan de vol s'adapte automatiquement.",
              },
              {
                icon: Navigation,
                title: "Trajectoire optimisée",
                desc: "Génération automatique de la trajectoire avec recouvrement optimal pour une reconstruction parfaite.",
              },
              {
                icon: Camera,
                title: "Paramètres de vol",
                desc: "Configurez altitude, vitesse, recouvrement avant/latéral, déclenchement photo.",
              },
              {
                icon: Layers,
                title: "Couches cartographiques",
                desc: "Visualisez votre zone sur fond satellite, OpenStreetMap ou cadastre.",
              },
              {
                icon: Maximize2,
                title: "Estimation de couverture",
                desc: "Calculez le nombre de photos nécessaires et la surface couverte en temps réel.",
              },
              {
                icon: Info,
                title: "Export du plan de vol",
                desc: "Exportez votre mission au format standard pour votre drone (DJI, Autel, etc.).",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-anthracite-800/30 border border-anthracite-700 rounded-xl"
              >
                <div className="w-10 h-10 gradient-cyan rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à <span className="text-gradient">planifier</span> vos missions ?
          </h2>
          <p className="text-gray-400 mb-8">
            Accédez au Mission Planner complet avec historique et à tous nos outils avec un abonnement
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Voir les tarifs
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tutorials"
              className="inline-flex items-center gap-2 px-8 py-4 border border-anthracite-600 text-gray-300 font-medium rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
            >
              Voir les tutoriels
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
