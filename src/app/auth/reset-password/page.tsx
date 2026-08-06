"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth/reset-password",
    });

    if (error) {
      setError(error.message || "Error al enviar el enlace. Verifica tu email.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="inline-block mb-6 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          ← Volver al inicio de sesión
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white">Trading Pro</span>
        </div>

        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50">
          <h1 className="text-2xl font-bold text-white mb-2">
            Restablecer Contraseña
          </h1>
          <p className="text-zinc-400 mb-6">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {success ? (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <p className="text-sm text-emerald-400">
                Revisa tu email para el enlace de restablecimiento.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-zinc-300 mb-1.5 block text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-emerald-500/50 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar enlace"}
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          ¿Recuerdas tu contraseña?{" "}
          <Link
            href="/auth/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
