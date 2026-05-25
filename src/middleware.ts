import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const publicPaths = [
  "/", "/services", "/pricing", "/tutorials", "/demo", "/mission-planner",
  "/about", "/contact",
  "/auth/login", "/auth/register", "/auth/callback",
  "/legal/mentions", "/legal/rgpd", "/legal/cgv",
  "/api",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/") ||
      pathname.startsWith("/_next") || pathname.startsWith("/images") ||
      pathname.startsWith("/favicon")
  );

  const { user, profile, supabaseResponse } = await updateSession(request);

  if (user) {
    request.headers.set("x-user-id", user.id);
    request.headers.set("x-user-email", user.email || "");
    if (profile) {
      request.headers.set("x-user-prenom", profile.prenom || "");
      request.headers.set("x-user-nom", profile.nom || "");
      request.headers.set("x-user-role", profile.role || "client");
      request.headers.set("x-abonnement-actif", profile.abonnement_actif ? "true" : "false");
      request.headers.set("x-user-type-compte", profile.type_compte || "particulier");
    }
  }

  if (isPublic) {
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
