import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import { LogOut, Menu } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, nom, abonnement_actif, type_compte, role")
    .eq("id", user.id)
    .single();

  const bypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true" ||
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const prenom = profile?.prenom || "Utilisateur";
  const nom = profile?.nom || "";
  const abonnementActif = bypass || profile?.abonnement_actif || false;
  const role = profile?.role || "client";

  return (
    <div className="min-h-screen bg-anthracite-900 flex pt-16">
      <DashboardSidebar
        prenom={prenom}
        nom={nom}
        typeCompte={profile?.type_compte || "particulier"}
        abonnementActif={abonnementActif}
        role={role}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-anthracite-800 border-b border-anthracite-700 px-6 py-3 lg:hidden flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{prenom} {nom}</p>
            <p className="text-xs text-gray-500">{profile?.type_compte === "artisan" ? "Artisan" : "Particulier"}</p>
          </div>
          <Link href="/auth/logout" className="text-gray-400 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </Link>
        </header>
        <div className="flex-1 p-6 lg:p-8 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
