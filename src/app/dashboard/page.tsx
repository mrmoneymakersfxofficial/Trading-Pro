"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Link2,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
  BarChart3,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Award,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import PremiumHeader from "@/components/shared/PremiumHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LICENSE_STATUS_CONFIG } from "@/lib/licenses";

// ─── Types ─────────────────────────────────────────────────
interface UserLicense {
  id: string;
  licenseKey: string;
  level: string;
  status: string;
  activatedAt: string | null;
  expiresAt: string | null;
}

interface TradingAccount {
  id: string;
  broker_name: string;
  account_number: number | null;
  account_type: string;
  leverage: string;
  base_currency: string;
  balance: number;
  equity: number;
  daily_pnl: number;
  total_pnl: number;
  open_trades: number;
  status: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
}

interface Commission {
  id: string;
  period_start: string;
  period_end: string;
  gross_profit: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  paid_at: string | null;
}

interface Snapshot {
  captured_at: string;
  balance: number;
  equity: number;
  daily_pnl: number;
}

// ─── Helpers ───────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

const statusLabel = (s: string) => {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Activa", color: "text-emerald-400" },
    pending: { label: "Pendiente", color: "text-yellow-400" },
    suspended: { label: "Suspendida", color: "text-red-400" },
  };
  return map[s] ?? { label: s, color: "text-zinc-400" };
};

const txBadge = (type: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    deposito: { label: "Depósito", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    retiro: { label: "Retiro", cls: "text-red-400 border-red-500/30 bg-red-500/10" },
    comision: { label: "Comisión", cls: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
    profit_share: { label: "Profit Share", cls: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  };
  const c = map[type] ?? { label: type, cls: "text-zinc-400 border-zinc-600" };
  return <Badge variant="outline" className={`${c.cls} text-xs`}>{c.label}</Badge>;
};

const txStatusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label: "Completada", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    pending: { label: "Pendiente", cls: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
    rejected: { label: "Rechazada", cls: "text-red-400 border-red-500/30 bg-red-500/10" },
  };
  const c = map[status] ?? { label: status, cls: "text-zinc-400 border-zinc-600" };
  return <Badge variant="outline" className={`${c.cls} text-xs`}>{c.label}</Badge>;
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

// ─── Mini Chart Component ──────────────────────────────────
function MiniChart({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  if (data.length < 2) return <div className="h-16 text-zinc-500 text-xs flex items-center">Sin datos</div>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 200;
  const h = 64;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────
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

  // Business data
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [primaryAccount, setPrimaryAccount] = useState<TradingAccount | null>(null);
  const [pendingCommissions, setPendingCommissions] = useState(0);
  const [paidCommissions, setPaidCommissions] = useState(0);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [hasActiveLicense, setHasActiveLicense] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  // ─── Auth ────────────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
  }, [status, router]);

  // ─── Load data ───────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [licRes, userRes, statsRes, txRes, comRes] = await Promise.all([
        fetch("/api/licenses/mine"),
        fetch("/api/users/me"),
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/transactions"),
        fetch("/api/dashboard/commissions"),
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
      if (statsRes.ok) {
        const data = await statsRes.json();
        setAccounts(data.accounts ?? []);
        setPrimaryAccount(data.primaryAccount ?? null);
        setPendingCommissions(data.pendingCommissions ?? 0);
        setPaidCommissions(data.paidCommissions ?? 0);
        setTotalDeposits(data.totalDeposits ?? 0);
        setTotalWithdrawals(data.totalWithdrawals ?? 0);
        setSnapshots(data.snapshots ?? []);
        setHasActiveLicense(data.hasActiveLicense ?? false);
      }
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions ?? []);
      }
      if (comRes.ok) {
        const data = await comRes.json();
        setCommissions(data.commissions ?? []);
      }
    } catch {
      // silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    loadData();
  }, [status, loadData]);

  // ─── Actions ─────────────────────────────────────────
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

  // ─── Loading state ───────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const hasActive = licenses.some((l) => l.status === "active");

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-x-hidden">
      <PremiumHeader
        variant="app"
        userName={session?.user?.email}
        userRole={session?.user?.role}
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-24 pb-10 space-y-8">
        {/* ─── Welcome ──────────────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.3 }}>
          <h1 className="text-3xl font-bold">
            Bienvenido, {session?.user?.name || "Trader"}
          </h1>
          <p className="text-zinc-400 mt-1">
            Gestiona tu cuenta, licencia y operaciones desde aquí.
          </p>
        </motion.div>

        {/* ─── Overview Cards ────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
        >
          {[
            {
              label: "Estado de Cuenta",
              value: hasActiveLicense ? "Activa" : primaryAccount?.status === "active" ? "Activa" : "Pendiente",
              icon: Shield,
              color: hasActiveLicense || primaryAccount?.status === "active" ? "text-emerald-400" : "text-yellow-400",
              bg: hasActiveLicense || primaryAccount?.status === "active" ? "bg-emerald-500/10" : "bg-yellow-500/10",
            },
            {
              label: "Balance",
              value: primaryAccount ? fmt(primaryAccount.balance) : "—",
              icon: Wallet,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "P&L Total",
              value: primaryAccount ? fmt(primaryAccount.total_pnl) : "—",
              icon: primaryAccount && primaryAccount.total_pnl >= 0 ? TrendingUp : TrendingDown,
              color: primaryAccount && primaryAccount.total_pnl >= 0 ? "text-emerald-400" : "text-red-400",
              bg: primaryAccount && primaryAccount.total_pnl >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
            },
            {
              label: "Comisión Pend.",
              value: fmt(pendingCommissions),
              icon: Clock,
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
            },
          ].map((card, i) => (
            <motion.div key={card.label} variants={fadeUp}>
              <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl hover:border-zinc-700 transition-colors">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color} mb-3`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xl font-bold">{card.value}</p>
                  <p className="text-xs text-zinc-400 mt-1">{card.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Mi Cuenta de Trading ──────────────────── */}
        {primaryAccount && (
          <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.1 }}>
            <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  Mi Cuenta de Trading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Account details */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Broker</span>
                      <span className="font-medium">{primaryAccount.broker_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400"># Cuenta</span>
                      <span className="font-mono font-medium">{primaryAccount.account_number ?? "—"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Tipo</span>
                      <span className="font-medium capitalize">{primaryAccount.account_type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Apalancamiento</span>
                      <span className="font-medium">{primaryAccount.leverage}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Estado</span>
                      <Badge variant="outline" className={`${statusLabel(primaryAccount.status).color} border-current text-xs`}>
                        {statusLabel(primaryAccount.status).label}
                      </Badge>
                    </div>
                  </div>

                  {/* Account metrics */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Balance</span>
                      <span className="font-semibold">{fmt(primaryAccount.balance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Equity</span>
                      <span className="font-semibold">{fmt(primaryAccount.equity)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">P&L Diario</span>
                      <span className={`font-semibold ${primaryAccount.daily_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {fmt(primaryAccount.daily_pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">P&L Total</span>
                      <span className={`font-semibold ${primaryAccount.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {fmt(primaryAccount.total_pnl)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Trades Abiertos</span>
                      <span className="font-semibold">{primaryAccount.open_trades}</span>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                {snapshots.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-zinc-400 mb-2">Evolución del Balance (30 días)</p>
                    <MiniChart data={snapshots.map((s) => s.balance)} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Activar Licencia ──────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
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
                  className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl shrink-0 min-w-[100px]"
                >
                  {activating ? "Validando..." : "Activar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Conexión al Broker ────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
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
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl min-h-[44px]"
                >
                  {savingBroker ? "Guardando..." : "Guardar Broker ID"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Mis Licencias ─────────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.25 }}>
          <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
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
                        <Badge variant="outline" className={`${cfg.color} border-current`}>
                          {cfg.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Historial de Transacciones ────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.3 }}>
          <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-emerald-400" />
                Historial de Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-zinc-500 text-sm">No hay transacciones.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Fecha</TableHead>
                        <TableHead className="text-zinc-400">Tipo</TableHead>
                        <TableHead className="text-zinc-400">Monto</TableHead>
                        <TableHead className="text-zinc-400">Estado</TableHead>
                        <TableHead className="text-zinc-400">Descripción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow key={t.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                          <TableCell className="text-sm text-zinc-400">{fmtDate(t.created_at)}</TableCell>
                          <TableCell>{txBadge(t.type)}</TableCell>
                          <TableCell className={`text-sm font-semibold ${
                            t.type === "deposito" || t.type === "profit_share"
                              ? "text-emerald-400"
                              : t.type === "retiro" || t.type === "comision"
                                ? "text-red-400"
                                : ""
                          }`}>
                            {fmt(t.amount)}
                          </TableCell>
                          <TableCell>{txStatusBadge(t.status)}</TableCell>
                          <TableCell className="text-sm text-zinc-300 max-w-[200px] truncate">
                            {t.description || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Comisiones ────────────────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.35 }}>
          <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                  Comisiones
                </CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-yellow-400">Pend: {fmt(pendingCommissions)}</span>
                  <span className="text-emerald-400">Pagado: {fmt(paidCommissions)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <p className="text-zinc-500 text-sm">No hay comisiones.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Período</TableHead>
                        <TableHead className="text-zinc-400">Ganancia Bruta</TableHead>
                        <TableHead className="text-zinc-400">Comisión (20%)</TableHead>
                        <TableHead className="text-zinc-400">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((c) => (
                        <TableRow key={c.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
                              {fmtDate(c.period_start)} — {fmtDate(c.period_end)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-emerald-400">
                            {fmt(c.gross_profit)}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-yellow-400">
                            {fmt(c.commission_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                c.status === "paid"
                                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-xs"
                                  : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10 text-xs"
                              }
                            >
                              {c.status === "paid" ? "Pagada" : "Pendiente"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Resumen de Operativa ──────────────────── */}
        <motion.div {...fadeUp} transition={{ duration: 0.3, delay: 0.4 }}>
          <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Resumen de Operativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Depósitos",
                    value: fmt(totalDeposits),
                    icon: ArrowUpRight,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                  },
                  {
                    label: "Total Retiros",
                    value: fmt(totalWithdrawals),
                    icon: ArrowDownRight,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                  },
                  {
                    label: "P&L Diario",
                    value: primaryAccount ? fmt(primaryAccount.daily_pnl) : "—",
                    icon: primaryAccount && primaryAccount.daily_pnl >= 0 ? TrendingUp : TrendingDown,
                    color: primaryAccount && primaryAccount.daily_pnl >= 0 ? "text-emerald-400" : "text-red-400",
                    bg: primaryAccount && primaryAccount.daily_pnl >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
                  },
                  {
                    label: "Win Rate",
                    value: snapshots.length > 0
                      ? `${Math.round((snapshots.filter((s) => s.daily_pnl > 0).length / snapshots.length) * 100)}%`
                      : "—",
                    icon: Target,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-2">
                    <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold">{item.value}</p>
                    <p className="text-xs text-zinc-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Message toast ─────────────────────────── */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl border text-sm font-medium shadow-lg z-50 ${
                message.type === "ok"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
