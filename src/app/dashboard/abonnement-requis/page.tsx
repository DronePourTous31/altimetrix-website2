import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

export default function AbonnementRequisPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-dark-800 mb-3 font-heading">
          Abonnement requis
        </h1>
        <p className="text-dark-500 mb-8">
          Le planificateur de vol est réservé aux abonnés actifs. 
          Activez un forfait pour débloquer cette fonctionnalité et profiter 
          de tous les outils AltiMetrix.
        </p>
        <Link
          href="/tarifs"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-colors shadow-lg shadow-primary-600/25"
        >
          Voir les offres <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="mt-4">
          <Link
            href="/dashboard"
            className="text-sm text-dark-400 hover:text-dark-600 transition-colors"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
