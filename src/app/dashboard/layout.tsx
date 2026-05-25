import { redirect } from "next/navigation";
import { headers } from "next/headers";
import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const userId = h.get("x-user-id");

  if (!userId) redirect("/auth/login");

  const prenom = h.get("x-user-prenom") || "Utilisateur";
  const nom = h.get("x-user-nom") || "";
  const abonnementActif = h.get("x-abonnement-actif") === "true";
  const typeCompte = h.get("x-user-type-compte") || "particulier";
  const role = h.get("x-user-role") || "client";

  return (
    <div className="min-h-screen bg-anthracite-900 flex pt-16">
      <DashboardSidebar
        prenom={prenom}
        nom={nom}
        typeCompte={typeCompte}
        abonnementActif={abonnementActif}
        role={role}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-anthracite-800 border-b border-anthracite-700 px-6 py-3 lg:hidden flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">{prenom} {nom}</p>
            <p className="text-xs text-gray-500">{typeCompte === "artisan" ? "Artisan" : "Particulier"}</p>
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
