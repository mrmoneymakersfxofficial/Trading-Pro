import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Hybrid proxy: uses Supabase Auth if keys available, else NextAuth JWT ──
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ─── Try Supabase Auth if keys are configured ──────────────
  if (supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 10) {
    try {
      const { updateSession } = await import("@/lib/supabase/middleware");
      return updateSession(req);
    } catch {
      // Fall through to NextAuth
    }
  }

  // ─── Fallback: NextAuth JWT-based protection ───────────────
  let userRole: string | null = null;
  let isAuthenticated = false;

  try {
    const { getToken } = await import("next-auth/jwt");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      isAuthenticated = true;
      userRole = token.role as string;
    }
  } catch {
    // Not authenticated
  }

  // ─── Rutas públicas ────────────────────────────────────────
  const publicPaths = ["/", "/auth/login", "/auth/register", "/api/auth"];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    if (isAuthenticated && (pathname === "/auth/login" || pathname === "/auth/register")) {
      const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
      const dest = userRole === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // ─── Protected routes ─────────────────────────────────────
  if (!isAuthenticated) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Admin routes ─────────────────────────────────────────
  const adminPaths = ["/admin", "/api/licenses/generate", "/api/users"];
  if (pathname === "/api/licenses" || adminPaths.some(p => pathname.startsWith(p))) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
