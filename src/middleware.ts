import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const isRscOrPrefetch =
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1";

  const { pathname } = request.nextUrl;
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/tutorials") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/mission-planner") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_rsc") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon");

  if (!user && !isPublic && !isRscOrPrefetch) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
