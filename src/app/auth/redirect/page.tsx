"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * Smart redirect after Google OAuth login.
 * Checks user role and redirects to /admin or /dashboard accordingly.
 */
export default function AuthRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } else if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      <p className="text-zinc-400 text-sm">Verificando acceso...</p>
    </div>
  );
}
