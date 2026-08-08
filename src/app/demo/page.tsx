"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Move3d, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const R2_BASE = "https://pub-0459c8bf6e9348e592f4decd8b6bab91.r2.dev";

const demos: Record<string, string> = {
  DEMO1: `${R2_BASE}/altimetrix/shared/index_3D.html?v=1&client=DEMO1`,
  DEMO2: `${R2_BASE}/altimetrix/shared/index_3D.html?v=1&client=DEMO2`,
  DEMO3: `${R2_BASE}/altimetrix/shared/index_3D.html?v=1&client=DEMO3`,
};

const features = [
  "Mesurez distances et surfaces en un clic",
  "Visualisez l'irradiation solaire sur votre toit",
  "Basculez entre vue 3D et DSM 2D",
  "Importez des objets 3D (panneaux, piscines...)",
  "Exportez vos mesures en PDF",
  "Partagez la vue avec votre client",
];

export default function DemoPage() {
  const [selectedDemo, setSelectedDemo] = useState("DEMO1");
  const [editMode, setEditMode] = useState(false);
  const [camCapture, setCamCapture] = useState<{
    viewType: string;
    position?: string;
    target?: string;
    fov?: string;
    center?: string;
    zoom?: string;
  } | null>(null);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (!e.data || !e.data.type) return;
      if (e.data.type === "cam_capture") {
        setCamCapture({
          viewType: "3d",
          position: e.data.position.join(";"),
          target: e.data.target.join(";"),
          fov: String(e.data.fov || 60),
        });
      } else if (e.data.type === "cam_capture_2d") {
        setCamCapture({
          viewType: "2d",
          center: e.data.center.join(";"),
          zoom: String(e.data.zoom || 18),
        });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then((res) => {
        if (
          "faures.nicolas@orange.fr" ===
          (res.data?.user?.email || "")
        ) {
          setEditMode(true);
        }
      });
  }, []);

  function buildFullUrl(key: string) {
    let url = demos[key];
    if (editMode) url += "&edit=1";
    if (camCapture) {
      if (camCapture.viewType === "2d") {
        url = url
          .replace("index_3D", "index_2D")
          + `&lat=${(camCapture.center || "").split(";")[0] || ""}`
          + `&lng=${(camCapture.center || "").split(";")[1] || ""}`
          + `&zoom=${camCapture.zoom || "18"}`;
      } else {
        url += `&position=[${camCapture.position}]&target=[${camCapture.target}]&FOV=${camCapture.fov}`;
      }
    }
    return url;
  }

  const currentSrc = demos[selectedDemo] + (editMode ? "&edit=1" : "");

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
                <span className="text-sm font-medium">Visualiseur 3D</span>
              </div>
              <div className="flex items-center gap-2">
                {Object.keys(demos).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDemo(key)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      selectedDemo === key
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        : "text-gray-400 border border-transparent hover:text-gray-200 hover:border-anthracite-600"
                    }`}
                  >
                    {key === "DEMO1" ? "Démo 1" : key === "DEMO2" ? "Démo 2" : "Démo 3"}
                  </button>
                ))}
                <a
                  href={buildFullUrl(selectedDemo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-white border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all"
                >
                  Ouvrir en plein écran
                  <ArrowRight className="w-4 h-4" />
                </a>
                <span className="text-[10px] text-gray-600">
                  {camCapture ? "✓" : "○"}
                </span>
              </div>
            </div>
            <div className="relative w-full" style={{ height: "75vh", minHeight: "500px" }}>
              <iframe
                key={currentSrc}
                src={currentSrc}
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
