import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Shield, Users, FolderOpen, BarChart3 } from "lucide-react";

export default async function AdminPage() {
  const h = await headers();
  const userId = h.get("x-user-id");
  if (!userId) redirect("/auth/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalProjects } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true });

  const { count: processingProjects } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true })
    .eq("statut", "en_traitement");

  const { count: completedProjects } = await supabase
    .from("projets")
    .select("*", { count: "exact", head: true })
    .eq("statut", "livre");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <Shield className="w-6 h-6 text-cyan-400" />
        Administration
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <Users className="w-5 h-5 text-cyan-400 mb-2" />
          <p className="text-2xl font-bold">{totalUsers || 0}</p>
          <p className="text-xs text-gray-500">Utilisateurs</p>
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <FolderOpen className="w-5 h-5 text-cyan-400 mb-2" />
          <p className="text-2xl font-bold">{totalProjects || 0}</p>
          <p className="text-xs text-gray-500">Projets total</p>
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <BarChart3 className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-amber-400">{processingProjects || 0}</p>
          <p className="text-xs text-gray-500">En traitement</p>
        </div>
        <div className="bg-anthracite-800/50 border border-anthracite-700 rounded-xl p-5">
          <BarChart3 className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-green-400">{completedProjects || 0}</p>
          <p className="text-xs text-gray-500">Livrés</p>
        </div>
      </div>

      <div className="bg-anthracite-800/30 border border-anthracite-700 rounded-xl p-12 text-center">
        <p className="text-gray-500 mb-4">Tableau de bord administrateur complet à venir.</p>
        <p className="text-sm text-gray-600">
          Gérez les utilisateurs, les projets et les forfaits depuis cette interface.
        </p>
      </div>
    </div>
  );
}
