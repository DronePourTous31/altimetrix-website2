"use client";

import Link from "next/link";
import {
  Move3d,
  Ruler,
  Sun,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  "Mesurez distances et surfaces en un clic",
  "Visualisez l'irradiation solaire sur votre toit",
  "Basculez entre vue 3D et DSM 2D",
  "Importez des objets 3D (panneaux, piscines...)",
  "Exportez vos mesures en PDF",
  "Partagez la vue avec votre client",
];

export default function DemoPage() {
  return (
    <>
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Démo <span className="text-gradient">Interactive</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Manipulez un modèle 3D réel. Tournez, zoomez, mesurez, et découvrez
            la puissance des outils AltiMetrix.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-anthracite-800 border border-anthracite-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-anthracite-700 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Move3d className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">Visualiseur 3D - Client : FAURES BRAX</span>
              </div>
              <a
                href="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/altimetrix/shared/index_3D.html?client=FAURES_LABEGE"
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
                src="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/altimetrix/shared/index_3D.html?client=FAURES_LABEGE"
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
                title="Visualiseur 3D AltiMetrix"
                allow="fullscreen; gyroscope; accelerometer; magnetometer; xr-spatial-tracking"
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
              Fonctionnalités de la <span className="text-gradient">démo</span>
            </h2>
            <p className="text-gray-400">
              Ce que vous pouvez faire dès maintenant
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 p-4 bg-anthracite-800/30 border border-anthracite-700 rounded-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à passer à <span className="text-gradient">l&apos;action</span> ?
          </h2>
          <p className="text-gray-400 mb-8">
            Créez votre compte et lancez votre premier projet de photogrammétrie
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              Commencer maintenant
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
