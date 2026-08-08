import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { uploadToR2, uploadToR2Altimetrix, r2Key, R2_ALTIMETRIX_PUBLIC_URL } from "@/lib/r2";
import fs from "fs";
import path from "path";

const ADMIN_IDS = ["cacfc3e4-e408-47f6-bc37-04d813625606"];
const CLIENTS_ROOT = process.env.CLIENTS_ROOT || "F:\\DRONE\\ALTIMETRIX\\CLIENTS";

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });
  if (!ADMIN_IDS.includes(user.id)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projetId = formData.get("projetId") as string;
    const category = formData.get("category") as string;
    const clientName = formData.get("clientName") as string;
    const projectName = formData.get("projectName") as string;

    if (!file || !projetId || !category || !clientName || !projectName) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase();
    const contentType = ext === ".dng"
      ? "image/x-adobe-dng"
      : `image/${ext.slice(1)}`;

    // R2 upload si configuré (service role pour bypasser la RLS : le projet
    // appartient au client, pas à l'admin qui uploade).
    const r2Configured = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY && process.env.R2_SECRET_KEY);
    if (r2Configured) {
      try {
        const key = r2Key(clientName, projectName, category, file.name);
        await uploadToR2(key, buffer, contentType);
        const storagePath = `r2://${process.env.R2_BUCKET || "altimetrix-uploads"}/clients/${clientName}/${projectName}`;

        // Copie publique (bucket altimetrix) : donne accès au client aux
        // photos du vol qu'il a payées (galerie sur la page projet).
        const filename = sanitize(file.name);
        const publicKey = `clients/${clientName}/${projectName}/PHOTOS/${category}/${filename}`;
        await uploadToR2Altimetrix(publicKey, buffer, contentType);
        const publicUrl = `${R2_ALTIMETRIX_PUBLIC_URL}/altimetrix/${publicKey}`;

        const { data: projet } = await admin
          .from("projets")
          .select("photos_uploaded")
          .eq("id", projetId)
          .single();
        const photos = Array.isArray(projet?.photos_uploaded) ? projet.photos_uploaded : [];
        const photosUpdated = [
          ...photos.filter((p: { category?: string; filename?: string } | null) => !(p?.category === category && p?.filename === filename)),
          { category, filename, url: publicUrl },
        ];

        await admin.from("projets").update({
          storage_path_input: storagePath,
          photos_uploaded: photosUpdated,
        }).eq("id", projetId);
        return NextResponse.json({ success: true, filename: file.name, size: buffer.length, type: category, storage: "r2" });
      } catch (err) {
        console.error("R2 upload error:", err);
        return NextResponse.json({ error: "Erreur upload R2" }, { status: 500 });
      }
    }

    // Fallback local (dev)
    const dir = path.join(CLIENTS_ROOT, clientName, projectName, "PHOTOS", category);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, file.name), buffer);

    await admin.from("projets").update({
      storage_path_input: path.join(CLIENTS_ROOT, clientName, projectName),
    }).eq("id", projetId);

    return NextResponse.json({ success: true, filename: file.name, size: buffer.length, storage: "local" });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
