import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

export default async function DashboardMissionPlannerPage({ searchParams }: { searchParams: Promise<{ dev?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const params = await searchParams;
  const bypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true" || params.dev === "1";

  const { data: profile } = await supabase
    .from("profiles")
    .select("abonnement_actif")
    .eq("id", user.id)
    .single();

  const abonnementActif = bypass || (profile?.abonnement_actif ?? false);

  if (!abonnementActif) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/10 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Mission Planner</h1>
        <p className="text-gray-400 mb-4">
          Le Mission Planner est réservé aux clients avec un abonnement actif.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-6 py-3 gradient-cyan text-white font-medium rounded-xl hover:opacity-90 transition-all"
        >
          Voir les tarifs <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-gray-600 mt-4">
          Vous pouvez essayer le Mission Planner en démonstration sur{" "}
          <Link href="/mission-planner" className="text-cyan-400 hover:text-cyan-300">cette page publique</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mission Planner</h1>
      <div className="bg-anthracite-800 border border-anthracite-700 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-anthracite-700">
          <span className="text-sm font-medium">Mission Planner AltiMetrix</span>
          <a
            href="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/MISSION_PLANNER/altimetrix_planner_v3d.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-white border border-cyan-500/30 rounded-lg hover:bg-cyan-500/10 transition-all"
          >
            Ouvrir en plein écran
          </a>
        </div>
        <div className="relative w-full" style={{ height: "70vh", minHeight: "500px" }}>
          <iframe
            src="https://altimetrix-557690596795-eu-north-1-an.s3.eu-north-1.amazonaws.com/MISSION_PLANNER/altimetrix_planner_v3d.html"
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
            title="Mission Planner AltiMetrix"
            allow="fullscreen; geolocation"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
