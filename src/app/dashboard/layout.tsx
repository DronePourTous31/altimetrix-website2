import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";
import { LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-anthracite-900 flex pt-16">
      <DashboardSidebar
        prenom=""
        nom=""
        typeCompte="particulier"
        abonnementActif={true}
        role="client"
      />
      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-anthracite-800 border-b border-anthracite-700 px-6 py-3 lg:hidden flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Utilisateur</p>
            <p className="text-xs text-gray-500">Particulier</p>
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
