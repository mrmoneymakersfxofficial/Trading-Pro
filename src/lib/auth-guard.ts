// Hybrid auth guard: tries Supabase Auth, then NextAuth as fallback
// Google OAuth users authenticate via NextAuth, NOT Supabase Auth

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ─── Try Supabase Auth first ──────────────────────────────
  if (supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 10) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Get role from our users table
        const { queryOne } = await import("@/lib/db-pg");
        const dbUser = await queryOne<{ id: string; email: string; name: string | null; role: string; image: string | null }>(
          "SELECT id, email, name, role, image FROM users WHERE email = $1",
          [user.email]
        );

        if (dbUser) {
          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
            role: dbUser.role,
          };
        }
      }
      // No Supabase session — fall through to NextAuth
    } catch {
      // Supabase Auth error — fall through to NextAuth
    }
  }

  // ─── Fallback: NextAuth.js (Google OAuth + Credentials) ───
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    return session.user as AuthUser;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (!isAdminUser(user)) throw new Error("Acceso denegado: se requiere rol admin");
  return user;
}

/**
 * Check if a user is admin — by role OR by email in ADMIN_EMAILS env var.
 * Use this in all API routes for consistent admin checks.
 */
export function isAdminUser(user: AuthUser): boolean {
  if (user.role === "admin") return true;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(user.email.toLowerCase());
}
