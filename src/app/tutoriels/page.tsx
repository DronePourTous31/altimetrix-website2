import type { Metadata } from "next";
import { ChecklistButton } from "@/components/ChecklistButton";

const videos = [
  {
    title: "Comment capter des photos pour une toiture",
    desc: "Protocole complet : angle, recouvrement, altitude, conditions idéales pour une photogrammétrie parfaite.",
    duration: "14:20",
    youtube: "dQw4w9WgXcQ",
  },
  {
    title: "Utiliser le Mission Planner AltiMetrix",
    desc: "Planifiez votre mission de vol drone directement depuis votre dashboard.",
    duration: "11:45",
    youtube: "dQw4w9WgXcQ",
  },
  {
    title: "Lire et utiliser son modèle 3D",
    desc: "Navigation, mesures, export — tout savoir sur le visualiseur 3D AltiMetrix.",
    duration: "9:30",
    youtube: "dQw4w9WgXcQ",
  },
  {
    title: "Réaliser un calepinage solaire",
    desc: "Analyse d'irradiation, calepinage optimal des panneaux et rapport solaire.",
    duration: "12:15",
    youtube: "dQw4w9WgXcQ",
  },
  {
    title: "Générer et exporter son rapport",
    desc: "Téléchargez vos rapports technique, solaire et les données brutes.",
    duration: "8:00",
    youtube: "dQw4w9WgXcQ",
  },
  {
    title: "Configurer son drone pour la photogrammétrie",
    desc: "Réglages appareil, vitesse, format RAW vs JPEG — tout ce qu'il faut savoir avant le vol.",
    duration: "15:20",
    youtube: "dQw4w9WgXcQ",
  },
];

export const metadata: Metadata = {
  title: "Tutoriels vidéo",
  description: "Maîtrisez la captation photogrammétrique et la plateforme AltiMetrix. Tutoriels pour couvreurs, installateurs solaires et professionnels du bâtiment.",
};

export default function TutorielsPage() {
  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-800 mb-4 font-heading">Tutoriels vidéo</h1>
          <p className="text-dark-500 max-w-2xl mx-auto">
            Maîtrisez la captation photogrammétrique et tirez le meilleur de la plateforme AltiMetrix.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {videos.map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-dark-100 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all group"
            >
              <div className="aspect-video bg-dark-200 relative overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.youtube}?rel=0`}
                  className="w-full h-full border-0"
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-dark-800 mb-1.5 text-sm">{v.title}</h3>
                <p className="text-dark-500 text-xs leading-relaxed">{v.desc}</p>
                <span className="inline-block mt-3 text-xs text-dark-400 bg-dark-50 px-2 py-0.5 rounded">{v.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Checklist téléchargeable */}
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-primary-50 to-dark-50 rounded-2xl border border-primary-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-dark-800 mb-3 font-heading">Protocole de captation drone optimal</h2>
          <p className="text-dark-500 text-sm mb-6 max-w-xl mx-auto">
            Téléchargez notre checklist pré-vol au format PDF pour ne rien oublier avant votre mission.
          </p>
          <ChecklistButton />
        </div>
      </div>
    </div>
  );
}
