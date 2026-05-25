import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { projet_id, statut, viewer_url, rapport_url } = await req.json();

  if (!projet_id || !statut) {
    return NextResponse.json({ error: "projet_id et statut requis" }, { status: 400 });
  }

  const update: Record<string, string> = { statut, updated_at: new Date().toISOString() };
  if (viewer_url) update.viewer_url = viewer_url;
  if (rapport_url) update.rapport_url = rapport_url;

  const { error } = await supabase.from("projets").update(update).eq("id", projet_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
