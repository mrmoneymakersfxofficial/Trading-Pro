import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // ─── Rutas públicas ────────────────────────────────────────
  const publicPaths = ["/", "/auth/login", "/auth/register", "/api/auth/callback"];
  if (publicPaths.some(p => pathname.startsWith(p))) {
    if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
      // Redirect authenticated users away from login/register
      const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
      const dest = adminEmails.includes(user.email ?? "") ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return supabaseResponse;
  }

  // ─── API auth callback — always allow ─────────────────────
  if (pathname.startsWith("/api/auth")) {
    return supabaseResponse;
  }

  // ─── Protected routes — require auth ──────────────────────
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Admin routes — only admin role ───────────────────────
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "");

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/licenses/generate") || pathname === "/api/licenses" || pathname === "/api/users") {
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return supabaseResponse;
}
