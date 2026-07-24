"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Move3d, Camera, ArrowRight, CheckCircle2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const R2 = "https://pub-0459c8bf6e9348e592f4decd8b6bab91.r2.dev";

const DEMOS: Record<string, string> = {
  DEMO1: `${R2}/altimetrix/shared/index_3D.html?v=1&client=DEMO1`,
  DEMO2: `${R2}/altimetrix/shared/index_3D.html?v=1&client=DEMO2`,
  DEMO3: `${R2}/altimetrix/shared/index_3D.html?v=1&client=DEMO3`,
};

const FEATURES = [
  "Mesurez distances et surfaces en un clic",
  "Visualisez l'irradiation solaire sur votre toit",
  "Basculez entre vue 3D et DSM 2D",
  "Importez des objets 3D (panneaux, piscines...)",
  "Exportez vos mesures en PDF",
  "Partagez la vue avec votre client",
];

export default function DemoPage() {
  const [demo, setDemo] = useState("DEMO1");
  const [editMode, setEditMode] = useState(false);
  const [camCapture, setCamCapture] = useState<{
    viewType: "3d" | "2d";
    position?: string;
    target?: string;
    fov?: string;
    center?: string;
    zoom?: string;
  } | null>(null);
  const [showParams, setShowParams] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "cam_capture") {
        setCamCapture({
          viewType: "3d",
          position: e.data.position.join(";"),
          target: e.data.target.join(";"),
          fov: String(e.data.fov || 60),
        });
        setShowParams(true);
      } else if (e.data?.type === "cam_capture_2d") {
        setCamCapture({
          viewType: "2d",
          center: e.data.center.join(";"),
          zoom: String(e.data.zoom || 18),
        });
        setShowParams(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data?.user?.email === "faures.nicolas@orange.fr") setEditMode(true);
    });
  }, []);

  const requestCapture = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "capture" }, "*");
  };

  const buildUrl = () => {
    let url = DEMOS[demo];
    if (editMode) url += "&edit=1";
    if (camCapture) {
      if (camCapture.viewType === "2d") {
        url = url.replace("index_3D", "index_2D");
        url += `&lat=${camCapture.center?.split(";")[0] || ""}&lng=${camCapture.center?.split(";")[1] || ""}&zoom=${camCapture.zoom || "18"}`;
      } else {
        url += `&position=[${camCapture.position}]&target=[${camCapture.target}]&FOV=${camCapture.fov}`;
      }
    }
    return url;
  };

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
                {Object.keys(DEMOS).map((k) => (
                  <button
                    key={k}
                    onClick={() => setDemo(k)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      demo === k
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        : "text-gray-400 border border-transparent hover:text-gray-200 hover:border-anthracite-600"
                    }`}
                  >
                    {k === "DEMO1" ? "Démo 1" : k === "DEMO2" ? "Démo 2" : "Démo 3"}
                  </button>
                ))}
                {editMode && (
                  <button
                    onClick={requestCapture}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-white border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Vue
                  </button>
                )}
                <a
                  href={buildUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-white border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all"
                >
                  Ouvrir en plein écran
                  <ArrowRight className="w-4 h-4" />
                </a>
                <span className="text-[10px] text-gray-600">{camCapture ? "✓" : "○"}</span>
              </div>
            </div>
            <div className="relative w-full" style={{ height: "75vh", minHeight: "500px" }}>
              <iframe
                ref={iframeRef}
                key={demo + (editMode ? "-edit" : "")}
                src={DEMOS[demo] + (editMode ? "&edit=1" : "")}
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
                title="Visualiseur 3D AltiMetrix"
                allow="fullscreen; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; clipboard-read; clipboard-write"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {camCapture && showParams && (
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-anthracite-800 border border-cyan-500/20 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-anthracite-700">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Paramètres de la vue {camCapture.viewType === "3d" ? "3D" : "2D"}
                </h3>
                <button onClick={() => setShowParams(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-2 text-sm">
                {camCapture.viewType === "3d" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Position</span>
                      <span className="text-gray-200 font-mono text-xs">{camCapture.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target</span>
                      <span className="text-gray-200 font-mono text-xs">{camCapture.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">FOV</span>
                      <span className="text-gray-200 font-mono text-xs">{camCapture.fov}°</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Centre (lat, lng)</span>
                      <span className="text-gray-200 font-mono text-xs">{camCapture.center}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zoom</span>
                      <span className="text-gray-200 font-mono text-xs">{camCapture.zoom}</span>
                    </div>
                  </>
                )}
                <div className="pt-2 border-t border-anthracite-700">
                  <a
                    href={buildUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-cyan-400 hover:text-white transition-colors"
                  >
                    Ouvrir avec ces paramètres →
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">
              Fonctionnalités de la <span className="text-gradient">démo</span>
            </h2>
            <p className="text-gray-400">Ce que vous pouvez faire dès maintenant</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {FEATURES.map((feature) => (
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
