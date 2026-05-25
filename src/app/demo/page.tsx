"use client";

import { useState } from "react";
import { Info, X, ExternalLink } from "lucide-react";

export default function DemoPage() {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="bg-dark-900 min-h-screen flex flex-col">
      {/* Mini header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700 shrink-0">
        <a href="/" className="text-white/60 hover:text-white text-xs font-heading font-bold transition-colors">
          ← AltiMetrix
        </a>
        <a
          href="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/altimetrix/shared/index_3D.html?client=FAURES_BRAX"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors shadow-lg"
        >
          <ExternalLink className="w-4 h-4" /> Ouvrir en plein écran
        </a>
      </div>

      {/* Info banner */}
      {showInfo && (
        <div className="flex items-start gap-3 px-4 py-3 bg-white/5 border-b border-white/10 shrink-0">
          <Info className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
          <p className="text-sm text-white/70 leading-relaxed">
            <strong className="text-primary-300">Ceci est un modèle de démonstration.</strong>{" "}
            Vos modèles réels sont traités sous <strong>24-48h</strong> après upload de vos photos.
          </p>
          <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* S3 Viewer iframe - plein écran sans overlap */}
      <iframe
        src="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/altimetrix/shared/index_3D.html?client=FAURES_BRAX"
        className="w-full flex-1 border-0"
        title="Démo 3D AltiMetrix"
        allow="fullscreen; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; clipboard-read; clipboard-write"
        allowFullScreen
      />

      {/* CTA footer - en dessous du viewer, pas par-dessus */}
      <div className="px-4 py-4 bg-dark-800 border-t border-dark-700 text-center shrink-0">
        <a href="/auth/register"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-primary-600/30"
        >
          Commencer avec ce type de résultat → Créer mon compte
        </a>
      </div>
    </div>
  );
}
