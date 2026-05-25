import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadToR2, r2Key } from "@/lib/r2";
import fs from "fs";
import path from "path";

const CLIENTS_ROOT = "F:\\DRONE\\ALTIMETRIX\\CLIENTS";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authé" }, { status: 401 });

  const projetId = req.headers.get("x-projet-id");
  const filename = req.headers.get("x-filename");
  const fileType = req.headers.get("x-type") || "NADIR";
  const clientName = req.headers.get("x-client-name");
  const projectName = req.headers.get("x-project-name");

  if (!projetId || !filename || !clientName || !projectName) {
    return NextResponse.json({ error: "Headers manquants" }, { status: 400 });
  }

  const buffer = Buffer.from(await req.arrayBuffer());
  const contentType = filename.toLowerCase().endsWith(".dng")
    ? "image/x-adobe-dng"
    : `image/${path.extname(filename).slice(1)}`;

  // Upload vers R2 si configuré
  const r2Configured = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY && process.env.R2_SECRET_KEY);
  if (r2Configured) {
    try {
      const key = r2Key(clientName, projectName, fileType, filename);
      await uploadToR2(key, buffer, contentType);
      const storagePath = `r2://${process.env.R2_BUCKET || "altimetrix-uploads"}/clients/${clientName}/${projectName}`;
      await supabase.from("projets").update({ storage_path_input: storagePath }).eq("id", projetId);
      return NextResponse.json({ success: true, filename, size: buffer.length, type: fileType, storage: "r2" });
    } catch (err) {
      const msg = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack}` : String(err);
      console.error("R2 upload error:", msg);
      return NextResponse.json({ error: "Erreur upload R2", detail: msg }, { status: 500 });
    }
  }

  // Fallback local (uniquement si le répertoire existe — typiquement en dev)
  if (fs.existsSync(CLIENTS_ROOT)) {
    const dir = path.join(CLIENTS_ROOT, clientName, projectName, "PHOTOS", fileType);
    const filepath = path.join(dir, filename);
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filepath, buffer);
      const projetRoot = path.join(CLIENTS_ROOT, clientName, projectName);
      await supabase.from("projets").update({ storage_path_input: projetRoot }).eq("id", projetId);
      return NextResponse.json({ success: true, filename, size: buffer.length, type: fileType, storage: "local" });
    } catch (err) {
      console.error("Upload error:", err);
      return NextResponse.json({ error: "Erreur écriture fichier" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Aucun stockage configuré (R2 ou local)" }, { status: 500 });
}