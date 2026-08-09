import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import path from "path";
import { sendEmail, uploadReceivedHtml } from "@/emails/templates";
import { sanitizeKeyPart } from "@/lib/r2";

export const runtime = "nodejs";

const CLIENTS_ROOT = process.env.CLIENTS_ROOT || "F:\\DRONE\\ALTIMETRIX\\CLIENTS";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const token = authHeader.slice(7);

  const authResp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  });

  if (!authResp.ok) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: serviceKey
        ? { headers: { Authorization: `Bearer ${serviceKey}` } }
        : { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { projetId, clientName, projectName } = await req.json();
  if (!projetId || !clientName || !projectName) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const r2Configured = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY && process.env.R2_SECRET_KEY);
  const safeClient = sanitizeKeyPart(clientName);
  const safeProject = sanitizeKeyPart(projectName);
  const storagePath = r2Configured
    ? `r2://${process.env.R2_BUCKET || "altimetrix-uploads"}/clients/${safeClient}/${safeProject}`
    : path.join(CLIENTS_ROOT, safeClient, safeProject);

  // Email de confirmation au PROPRIÉTAIRE du projet (l'admin uploade pour le
  // client) → on cherche le user_id du projet, pas le token détenteur.
  const { data: projet } = await supabase
    .from("projets")
    .select("user_id, nom, statut")
    .eq("id", projetId)
    .single();

  // Un projet en "erreur" (échec pipeline précédent) qui reçoit un nouvel
  // upload repasse en "upload_en_attente" → le watcher local le retraite.
  // Les autres statuts (en_traitement, livre…) ne sont pas modifiés.
  const statut = projet?.statut === "erreur" ? "upload_en_attente" : projet?.statut;

  await supabase
    .from("projets")
    .update({
      storage_path_input: storagePath,
      upload_termine: true,
      ...(statut ? { statut } : {}),
    })
    .eq("id", projetId);

  let emailOwner: string | null = null;
  if (projet?.user_id) {
    const adminSvc = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` } },
        cookies: { getAll: () => [], setAll: () => {} },
      }
    );
    const { data: { user: ownerUser } } = await adminSvc.auth.admin.getUserById(projet.user_id);
    emailOwner = ownerUser?.email || null;
  }

  if (emailOwner && projet?.user_id) {
    let ownerPrenom: string | null = null;
    try {
      const { data } = await supabase.from("profiles").select("prenom").eq("id", projet.user_id).single();
      ownerPrenom = data?.prenom ?? null;
    } catch {}
    sendEmail({
      to: emailOwner,
      subject: "Upload reçu — votre projet est en cours",
      html: uploadReceivedHtml(ownerPrenom || "", projectName),
    }).catch((err) => console.error("Email upload reçu error:", err));
  }

  return NextResponse.json({ success: true, storagePath, uploadTermine: true });
}
