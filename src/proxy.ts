import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // ─── Rutas públicas (siempre accesibles) ──────────────────────
  const publicPaths = ["/", "/auth/login", "/auth/register"];
  if (publicPaths.includes(pathname)) {
    // Si ya está autenticado y va a login/register, redirigir según rol
    if (token) {
      const dest = token.role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // ─── Rutas de API de auth — siempre permitir ────────────────
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ─── Rutas protegidas — requiere autenticación ──────────────
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Rutas de admin — solo rol "admin" ──────────────────────
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/licenses/generate") ||
    pathname === "/api/licenses" ||
    pathname === "/api/users"
  ) {
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // ─── Rutas de dashboard — admin también puede verlo ─────
  if (pathname.startsWith("/dashboard") && token.role === "admin") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
