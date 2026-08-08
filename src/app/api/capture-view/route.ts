import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client, position, target, fov } = body;
    if (!client || !position || !target) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const data = { position, target, fov: fov || 60 };
    const res = NextResponse.json({ ok: true });
    res.cookies.set("cam_capture_" + client, JSON.stringify(data), {
      path: "/",
      sameSite: "none",
      secure: true,
      maxAge: 86400,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
