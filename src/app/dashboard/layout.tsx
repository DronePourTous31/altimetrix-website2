import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardSidebar from "@/components/DashboardSidebar";

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

  return (
    <div className="min-h-screen bg-anthracite-900 flex pt-16 lg:pt-20">
      <DashboardSidebar />
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 p-4 lg:p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
