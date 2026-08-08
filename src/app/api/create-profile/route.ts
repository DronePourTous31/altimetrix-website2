import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authé" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const authResp = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
  });
  if (!authResp.ok) return NextResponse.json({ error: "Non authé" }, { status: 401 });
  const user = await authResp.json();

  const { prenom, nom, type_compte, siret } = await req.json();

  const body = JSON.stringify({
    id: user.id,
    prenom: prenom || "",
    nom: nom || "",
    type_compte: type_compte || "particulier",
    siret: siret || null,
    plan_id: "solar-pro",
    essais_gratuits_restants: 3,
  });

  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body,
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
