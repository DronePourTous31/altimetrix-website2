import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/DashboardSidebar";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, nom, abonnement_actif, type_compte")
    .eq("id", user.id)
    .single();

  const bypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";
  const prenom = profile?.prenom || "Utilisateur";
  const nom = profile?.nom || "";
  const abonnementActif = bypass || profile?.abonnement_actif || false;

  return (
    <div className="min-h-[80vh] bg-dark-50 flex">
      <DashboardSidebar
        prenom={prenom}
        nom={nom}
        typeCompte={profile?.type_compte || "particulier"}
        abonnementActif={abonnementActif}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-white border-b border-dark-100 px-6 lg:px-8 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-800">{prenom} {nom}</p>
              <p className="text-xs text-dark-400">{profile?.type_compte === "artisan" ? "Artisan" : "Particulier"}</p>
            </div>
            <a href="/auth/logout" className="text-dark-400 hover:text-dark-600">
              <LogOut className="w-5 h-5" />
            </a>
          </div>
        </header>
        <div className="flex-1 p-6 lg:p-8 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
