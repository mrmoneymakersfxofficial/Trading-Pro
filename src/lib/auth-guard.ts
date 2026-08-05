// Hybrid auth guard: Supabase Auth if keys available, else NextAuth

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

      if (!user) return null;

      // Get role from our users table
      const { queryOne } = await import("@/lib/db-pg");
      const dbUser = await queryOne<{ id: string; email: string; name: string | null; role: string; image: string | null }>(
        "SELECT id, email, name, role, image FROM users WHERE email = $1",
        [user.email]
      );

      if (!dbUser) return null;

      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
        role: dbUser.role,
      };
    } catch {
      // Fall through to NextAuth
    }
  }

  // ─── Fallback: NextAuth ───────────────────────────────────
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
  if (user.role !== "admin") throw new Error("Acceso denegado: se requiere rol admin");
  return user;
}
