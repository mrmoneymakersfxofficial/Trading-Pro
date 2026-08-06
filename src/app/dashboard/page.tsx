"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Key,
  Link2,
  Shield,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LICENSE_STATUS_CONFIG } from "@/lib/licenses";

interface UserLicense {
  id: string;
  licenseKey: string;
  level: string;
  status: string;
  activatedAt: string | null;
  expiresAt: string | null;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [licenseKey, setLicenseKey] = useState("");
  const [brokerId, setBrokerId] = useState("");
  const [currentBrokerId, setCurrentBrokerId] = useState("");
  const [licenses, setLicenses] = useState<UserLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [savingBroker, setSavingBroker] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  // Load data
  useEffect(() => {
    if (status !== "authenticated") return;
    loadData();
  }, [status]);

  async function loadData() {
    try {
      const [licRes, userRes] = await Promise.all([
        fetch("/api/licenses/mine"),
        fetch("/api/users/me"),
      ]);
      if (licRes.ok) {
        const data = await licRes.json();
        setLicenses(data.licenses ?? []);
      }
      if (userRes.ok) {
        const data = await userRes.json();
        setCurrentBrokerId(data.brokerId ?? "");
        setBrokerId(data.brokerId ?? "");
      }
    } catch {
      // silently
    } finally {
      setLoading(false);
    }
  }

  async function activateLicense() {
    if (!licenseKey.trim()) return;
    setActivating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/licenses/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseKey.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "ok", text: "Licencia activada exitosamente." });
        setLicenseKey("");
        loadData();
      } else {
        setMessage({ type: "err", text: data.error || "Error al activar licencia." });
      }
    } catch {
      setMessage({ type: "err", text: "Error de conexión." });
    } finally {
      setActivating(false);
    }
  }

  async function saveBrokerId() {
    setSavingBroker(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brokerId }),
      });
      if (res.ok) {
        setCurrentBrokerId(brokerId);
        setMessage({ type: "ok", text: "Broker ID actualizado." });
      }
    } catch {
      setMessage({ type: "err", text: "Error al guardar." });
    } finally {
      setSavingBroker(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // Determinar estado general de licencia
  const hasActive = licenses.some((l) => l.status === "active");

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold">EA Trading Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400 hidden sm:block">
              {session?.user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Salir
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold">
            Bienvenido, {session?.user?.name || "Trader"}
          </h1>
          <p className="text-zinc-400 mt-1">
            Gestiona tu licencia y conexión al broker desde aquí.
          </p>
        </div>

        {/* Status overview card */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-emerald-400" />
              Estado de tu Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {hasActive ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-emerald-400">Cuenta Activa</p>
                    <p className="text-sm text-zinc-400">
                      Tienes al menos una licencia activa. El bot puede operar.
                    </p>
                  </div>
                </>
              ) : licenses.length > 0 ? (
                <>
                  <XCircle className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="font-semibold text-red-400">Sin Licencia Activa</p>
                    <p className="text-sm text-zinc-400">
                      Activa una licencia para habilitar el bot de trading.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Clock className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="font-semibold text-yellow-400">Pendiente</p>
                    <p className="text-sm text-zinc-400">
                      Aún no tienes licencias. Ingresa una clave para empezar.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activate license */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="w-5 h-5 text-emerald-400" />
              Activar Licencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              Ingresa la clave de licencia que recibiste para desbloquear el bot de trading.
            </p>
            <div className="flex gap-3">
              <Input
                placeholder="TP-XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="h-11 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl font-mono tracking-wider focus:border-emerald-500/50"
              />
              <Button
                onClick={activateLicense}
                disabled={activating || !licenseKey.trim()}
                className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl shrink-0"
              >
                {activating ? "Validando..." : "Activar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Broker ID */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Link2 className="w-5 h-5 text-emerald-400" />
              Conexión al Broker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400 mb-4">
              Ingresa tu ID de cuenta del broker (MT4/MT5) para vincular el bot.
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-300 mb-1.5 block text-sm">
                  ID de Cuenta (MT4/MT5)
                </Label>
                <Input
                  placeholder="Ej: 12345678"
                  value={brokerId}
                  onChange={(e) => setBrokerId(e.target.value)}
                  className="h-11 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl focus:border-emerald-500/50"
                />
              </div>
              <Button
                onClick={saveBrokerId}
                disabled={savingBroker || brokerId === currentBrokerId}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl"
              >
                {savingBroker ? "Guardando..." : "Guardar Broker ID"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Licenses list */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-emerald-400" />
              Mis Licencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {licenses.length === 0 ? (
              <p className="text-zinc-500 text-sm">
                No tienes licencias registradas. Activa una clave arriba.
              </p>
            ) : (
              <div className="space-y-3">
                {licenses.map((lic) => {
                  const cfg = LICENSE_STATUS_CONFIG[lic.status] ?? LICENSE_STATUS_CONFIG.pending;
                  return (
                    <div
                      key={lic.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${cfg.bg}`}
                    >
                      <div>
                        <p className="font-mono text-sm text-white">{lic.licenseKey}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {lic.level.toUpperCase()} ·{" "}
                          {lic.expiresAt
                            ? `Vence: ${new Date(lic.expiresAt).toLocaleDateString("es")}`
                            : "Sin activar"}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${cfg.color} border-current`}
                      >
                        {cfg.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message toast */}
        {message && (
          <div
            className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl border text-sm font-medium shadow-lg ${
              message.type === "ok"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}
      </main>
    </div>
  );
}
