import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

export default function AbonnementRequisPage() {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/10 rounded-full flex items-center justify-center">
        <Lock className="w-8 h-8 text-cyan-400" />
      </div>
      <h1 className="text-2xl font-bold mb-3">Abonnement requis</h1>
      <p className="text-gray-400 mb-8">
        Cette fonctionnalité nécessite un abonnement actif.
        Souscrivez à l&apos;un de nos forfaits pour y accéder.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
      >
        Voir les tarifs <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
