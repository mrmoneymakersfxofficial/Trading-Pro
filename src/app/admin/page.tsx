"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Users,
  Key,
  Plus,
  Ban,
  Pause,
  Play,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LICENSE_STATUS_CONFIG,
  LICENSE_DURATIONS,
  LICENSE_LEVELS,
  LICENSE_DURATION_LABELS,
  LICENSE_LEVEL_LABELS,
} from "@/lib/licenses";
import type { LicenseDuration, LicenseLevel } from "@/lib/licenses";

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  role: string;
  brokerId: string | null;
  createdAt: string;
}

interface LicenseInfo {
  id: string;
  key: string;
  level: string;
  durationMonths: number;
  status: string;
  assignedToEmail: string | null;
  createdAt: string;
}

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [licenses, setLicenses] = useState<LicenseInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [genLevel, setGenLevel] = useState<LicenseLevel>("standard");
  const [genDuration, setGenDuration] = useState<LicenseDuration>(1);
  const [genCount, setGenCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "admin") loadData();
  }, [session]);

  async function loadData() {
    setLoading(true);
    try {
      const [uRes, lRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/licenses"),
      ]);
      if (uRes.ok) setUsers((await uRes.json()).users ?? []);
      if (lRes.ok) setLicenses((await lRes.json()).licenses ?? []);
    } catch {
      // silently
    } finally {
      setLoading(false);
    }
  }

  async function generateLicenses() {
    setGenerating(true);
    try {
      const res = await fetch("/api/licenses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: genLevel,
          durationMonths: genDuration,
          count: genCount,
        }),
      });
      if (res.ok) {
        setDialogOpen(false);
        loadData();
      }
    } catch {
      // silently
    } finally {
      setGenerating(false);
    }
  }

  async function revokeLicense(id: string) {
    await fetch(`/api/licenses/${id}/revoke`, { method: "POST" });
    loadData();
  }

  async function pauseLicense(id: string) {
    await fetch(`/api/licenses/${id}/pause`, { method: "POST" });
    loadData();
  }

  async function resumeLicense(id: string) {
    await fetch(`/api/licenses/${id}/resume`, { method: "POST" });
    loadData();
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(searchUser.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold">EA Trading Pro</span>
            <Badge variant="outline" className="ml-2 text-emerald-400 border-emerald-500/30">
              ADMIN
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
              onClick={loadData}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </Button>
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-zinc-400 mt-1">
            Gestiona usuarios, genera y controla licencias.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { label: "Usuarios", value: users.length, icon: Users },
            { label: "Licencias Totales", value: licenses.length, icon: Key },
            {
              label: "Activas",
              value: licenses.filter((l) => l.status === "assigned" || l.status === "available").length,
              icon: Play,
            },
            {
              label: "Revocadas",
              value: licenses.filter((l) => l.status === "revoked").length,
              icon: Ban,
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-zinc-800 bg-zinc-900/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users table */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-emerald-400" />
                Usuarios Registrados
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por email o nombre..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-9 h-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-lg text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Email</TableHead>
                    <TableHead className="text-zinc-400">Nombre</TableHead>
                    <TableHead className="text-zinc-400">Rol</TableHead>
                    <TableHead className="text-zinc-400">Broker ID</TableHead>
                    <TableHead className="text-zinc-400">Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                      <TableCell className="font-mono text-sm">{u.email}</TableCell>
                      <TableCell className="text-sm">{u.name || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            u.role === "admin"
                              ? "text-emerald-400 border-emerald-500/30"
                              : "text-zinc-400 border-zinc-600"
                          }
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {u.brokerId || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-400">
                        {new Date(u.createdAt).toLocaleDateString("es")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                        No se encontraron usuarios.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Licenses management */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="w-5 h-5 text-emerald-400" />
                Gestión de Licencias
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Generar Licencia
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Generar Nueva Licencia</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label className="text-zinc-300 mb-2 block">Nivel</Label>
                      <Select
                        value={genLevel}
                        onValueChange={(v) => setGenLevel(v as LicenseLevel)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {LICENSE_LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>
                              {LICENSE_LEVEL_LABELS[l]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-zinc-300 mb-2 block">Duración</Label>
                      <Select
                        value={String(genDuration)}
                        onValueChange={(v) => setGenDuration(Number(v) as LicenseDuration)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {LICENSE_DURATIONS.map((d) => (
                            <SelectItem key={d} value={String(d)}>
                              {LICENSE_DURATION_LABELS[d]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-zinc-300 mb-2 block">Cantidad</Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={genCount}
                        onChange={(e) => setGenCount(Math.max(1, Math.min(50, Number(e.target.value))))}
                        className="bg-zinc-800 border-zinc-700 rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={generateLicenses}
                      disabled={generating}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl"
                    >
                      {generating ? "Generando..." : `Generar ${genCount} Licencia${genCount > 1 ? "s" : ""}`}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400">Clave</TableHead>
                    <TableHead className="text-zinc-400">Nivel</TableHead>
                    <TableHead className="text-zinc-400">Duración</TableHead>
                    <TableHead className="text-zinc-400">Estado</TableHead>
                    <TableHead className="text-zinc-400">Asignada a</TableHead>
                    <TableHead className="text-zinc-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((lic) => {
                    const cfg = LICENSE_STATUS_CONFIG[lic.status] ?? LICENSE_STATUS_CONFIG.pending;
                    return (
                      <TableRow key={lic.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                        <TableCell className="font-mono text-sm">{lic.key}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              lic.level === "pro"
                                ? "text-cyan-400 border-cyan-500/30"
                                : "text-zinc-400 border-zinc-600"
                            }
                          >
                            {lic.level.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{lic.durationMonths} mes{lic.durationMonths > 1 ? "es" : ""}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${cfg.color} border-current`}>
                            {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-zinc-400">
                          {lic.assignedToEmail || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {lic.status !== "revoked" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                title="Revocar"
                                onClick={() => revokeLicense(lic.id)}
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            )}
                            {lic.status === "assigned" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                title="Pausar"
                                onClick={() => pauseLicense(lic.id)}
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                            )}
                            {lic.status === "paused" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                title="Reanudar"
                                onClick={() => resumeLicense(lic.id)}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {licenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                        No hay licencias. Genera una con el botón de arriba.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
