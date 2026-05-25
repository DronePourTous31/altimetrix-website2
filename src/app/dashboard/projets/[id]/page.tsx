import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjetLivrable from "@/components/projects/ProjetLivrable";

export default async function ProjetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;

  const { data: projet } = await supabase
    .from("projets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!projet) notFound();

  return (
    <div className="max-w-5xl mx-auto">
      <ProjetLivrable projet={projet} />
    </div>
  );
}
