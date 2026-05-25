"use client";

import { ExternalLink } from "lucide-react";

const S3_PLANNER_URL = "https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/MISSION_PLANNER/altimetrix_planner_v3d.html";

export default function MissionPlannerPage() {
  return (
    <div className="bg-dark-900 min-h-screen flex flex-col">
      {/* Mini header */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-700 shrink-0">
        <a href="/" className="text-white/60 hover:text-white text-xs font-heading font-bold transition-colors">
          ← AltiMetrix
        </a>
        <a
          href={S3_PLANNER_URL}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors shadow-lg"
        >
          <ExternalLink className="w-4 h-4" /> Plein écran
        </a>
      </div>

      {/* S3 Planner iframe */}
      <iframe
        src={S3_PLANNER_URL}
        className="w-full flex-1 border-0"
        title="Mission Planner AltiMetrix"
        allowFullScreen
      />
    </div>
  );
}