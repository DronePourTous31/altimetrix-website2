import { NextResponse } from "next/server";
import { getUploadUrl, sanitizeKeyPart } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const authResp = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        Authorization: `Bearer ${authHeader.slice(7)}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    }
  );

  if (!authResp.ok) {
    const text = await authResp.text();
    return NextResponse.json({ error: "Non authé", detail: text }, { status: 401 });
  }

  const { clientName, projectName, category, filename, contentType } =
    await req.json();

  const safeClient = sanitizeKeyPart(clientName);
  const safeProject = sanitizeKeyPart(projectName);
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `clients/${safeClient}/${safeProject}/PHOTOS/${category}/${safeFilename}`;
  const uploadUrl = await getUploadUrl(key);

  return NextResponse.json({ uploadUrl, key, filename: safeFilename, clientName: safeClient, projectName: safeProject, contentType });
}
