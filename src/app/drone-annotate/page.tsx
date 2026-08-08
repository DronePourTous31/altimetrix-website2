"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  MapPin,
  Camera,
  Layers,
  Ruler,
  Maximize2,
  Info,
  Download,
} from "lucide-react";

const DEMO_DATA_URL =
  "https://pub-0459c8bf6e9348e592f4decd8b6bab91.r2.dev/DEMOS/DEMO3";
const SHARED_URL =
  "https://pub-0459c8bf6e9348e592f4decd8b6bab91.r2.dev/altimetrix/shared";

export default function DroneAnnotatePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const sendInit = () => {
      iframe.contentWindow?.postMessage(
        {
          type: "alti-init",
          dataUrl: DEMO_DATA_URL,
          clientRoot: "DEMO3",
          sharedUrl: SHARED_URL,
        },
        "*"
      );
    };

    iframe.addEventListener("load", sendInit);
    const fallback = window.setTimeout(sendInit, 1500);
    return () => {
      iframe.removeEventListener("load", sendInit);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <>
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Drone <span className="text-gradient">Annotate</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Outil de visualisation et d&apos;annotation pour vos données
            drone. Chargez orthophoto, DSM, photos NADIR et rasters de
            santé végétale, puis annotez, mesurez et exportez.
          </p>
        </div>
      </section>

      <section className="pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-cyan-400 font-medium text-sm sm:text-base">
                Démonstration chargée avec les données DEMO3.
                Les données sont chargées automatiquement depuis le cloud.
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
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium">Drone-Annotate - DEMO3</span>
              </div>
              <a
                href="https://pub-0459c8bf6e9348e592f4decd8b6bab91.r2.dev/altimetrix/shared/drone-annotate.html?client=DEMO3"
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
                ref={iframeRef}
                src="https://pub-0459c8bf6e9348e592f4decd8b6bab91.r2.dev/altimetrix/shared/drone-annotate.html?client=DEMO3"
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
                title="Drone-Annotate AltiMetrix"
                allow="fullscreen; geolocation"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">
              Fonctionnalités de <span className="text-gradient">Drone-Annotate</span>
            </h2>
            <p className="text-gray-400">
              Un outil complet pour exploiter vos données drone
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: "Orthophoto + DSM",
                desc: "Visualisez l'orthophoto et le DSM avec colormap personnalisable en un clic.",
              },
              {
                icon: Camera,
                title: "Photos NADIR",
                desc: "Parcourez les photos NADIR chargées automatiquement, avec marqueurs d'inspection.",
              },
              {
                icon: Ruler,
                title: "Mesures & Annotations",
                desc: "Mesurez distances, surfaces, angles. Ajoutez des annotations, niveaux, polygones.",
              },
              {
                icon: Download,
                title: "Export GeoJSON / CSV",
                desc: "Exportez vos annotations et mesures aux formats GeoJSON et CSV.",
              },
              {
                icon: MapPin,
                title: "Santé Végétale",
                desc: "5 indices de végétation (VARI, GLI, ExG, GRVI, MPRI) chargés depuis le cloud.",
              },
              {
                icon: Maximize2,
                title: "Vue 3D & Plein écran",
                desc: "Basculez entre les couches raster et ouvrez en plein écran pour une immersion totale.",
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
            Vous voulez <span className="text-gradient">essayer</span> avec vos données ?
          </h2>
          <p className="text-gray-400 mb-8">
            Créez votre compte et uploadez vos photos drone pour obtenir
            votre propre orthophoto, DSM et outils d&apos;analyse.
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
              href="/demo"
              className="inline-flex items-center gap-2 px-8 py-4 border border-anthracite-600 text-gray-300 font-medium rounded-xl hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
            >
              Voir la démo 3D
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
