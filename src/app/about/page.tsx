"use client";

import Link from "next/link";
import { ArrowRight, Target, Eye, Zap, Heart, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            À propos <span className="text-gradient">d&apos;AltiMetrix</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Rendre la photogrammétrie par drone accessible à tous les artisans et particuliers,
            grâce à l&apos;automatisation et une plateforme SaaS intuitive.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Notre <span className="text-gradient">vision</span>
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  AltiMetrix est né d&apos;un constat simple : les artisans (couvreurs,
                  installateurs solaire, pisciniers, paysagistes) passent un temps
                  considérable à faire des mesures sur les chantiers, et peinent à
                  convaincre leurs clients du bien-fondé de leurs devis.
                </p>
                <p>
                  En combinant photogrammétrie par drone, automatisation et plateforme
                  SaaS, nous permettons à nos clients de capturer leurs propres photos,
                  de générer des modèles 3D précis en 48h, et d&apos;exploiter une suite
                  d&apos;outils professionnels pour mesure, calepinage et analyse solaire.
                </p>
                <p>
                  Notre modèle est scalable par nature : le client capte ses photos,
                  notre pipeline automatisé traite les données, et la plateforme livre
                  les résultats. Cela nous permet de servir des clients partout en
                  France, sans limite géographique.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-anthracite-800 to-anthracite-900 rounded-2xl border border-anthracite-700 p-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 gradient-cyan rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">A</span>
                </div>
                <div className="text-2xl font-bold mb-2">
                  Alti<span className="text-cyan-400">Metrix</span>
                </div>
                <p className="text-sm text-gray-400">
                  Photogrammétrie par drone — Solution SaaS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-anthracite-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              Nos <span className="text-gradient">valeurs</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Target, title: "Précision", desc: "Des mesures centimétriques pour des décisions fiables." },
              { icon: Zap, title: "Automatisation", desc: "Un pipeline 100% automatisé pour une scalabilité maximale." },
              { icon: Eye, title: "Transparence", desc: "Des tarifs clairs, sans engagement, sans surprise." },
              { icon: Heart, title: "Accessibilité", desc: "La photogrammétrie à la portée de tous les artisans." },
              { icon: Globe, title: "National", desc: "Servez vos clients partout en France sans vous déplacer." },
              { icon: Heart, title: "Innovation", desc: "À la pointe des technologies drone et traitement d'images." },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 gradient-cyan rounded-xl flex items-center justify-center">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Rejoignez l&apos;aventure <span className="text-gradient">AltiMetrix</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Créez votre compte et découvrez comment transformer votre activité
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
          >
            Créer mon compte
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
