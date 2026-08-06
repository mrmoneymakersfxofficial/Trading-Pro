"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Key,
  Plus,
  Ban,
  Pause,
  Play,
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  BarChart3,
  Shield,
  Eye,
  RefreshCw,
  CircleDollarSign,
  CalendarDays,
} from "lucide-react";
import PremiumHeader from "@/components/shared/PremiumHeader";
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

// ─── Types ─────────────────────────────────────────────────
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

interface TradingAccount {
  id: string;
  user_id: string;
  email: string;
  name: string;
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
  created_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  email: string;
  name: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

interface Commission {
  id: string;
  user_id: string;
  email: string;
  name: string;
  trading_account_id: string | null;
  period_start: string;
  period_end: string;
  gross_profit: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  paid_at: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsersMonth: number;
  totalAccounts: number;
  activeAccounts: number;
  totalBalance: number;
  pendingCommissions: number;
  paidCommissions: number;
  depositsMonth: number;
  withdrawalsMonth: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
}

type TabKey = "resumen" | "usuarios" | "cuentas" | "transacciones" | "comisiones" | "licencias";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "resumen", label: "Resumen", icon: BarChart3 },
  { key: "usuarios", label: "Usuarios", icon: Users },
  { key: "cuentas", label: "Cuentas", icon: Building2 },
  { key: "transacciones", label: "Transacciones", icon: CreditCard },
  { key: "comisiones", label: "Comisiones", icon: CircleDollarSign },
  { key: "licencias", label: "Licencias", icon: Key },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Activa", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    pending: { label: "Pendiente", cls: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
    suspended: { label: "Suspendida", cls: "text-red-400 border-red-500/30 bg-red-500/10" },
    completed: { label: "Completada", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    rejected: { label: "Rechazada", cls: "text-red-400 border-red-500/30 bg-red-500/10" },
    paid: { label: "Pagada", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  };
  const c = map[status] ?? { label: status, cls: "text-zinc-400 border-zinc-600 bg-zinc-500/10" };
  return <Badge variant="outline" className={`${c.cls} text-xs`}>{c.label}</Badge>;
};

const txTypeBadge = (type: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    deposito: { label: "Depósito", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    retiro: { label: "Retiro", cls: "text-red-400 border-red-500/30 bg-red-500/10" },
    comision: { label: "Comisión", cls: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" },
    profit_share: { label: "Profit Share", cls: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10" },
  };
  const c = map[type] ?? { label: type, cls: "text-zinc-400 border-zinc-600" };
  return <Badge variant="outline" className={`${c.cls} text-xs`}>{c.label}</Badge>;
};

// ─── Animation variants ───────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

// ─── Main Component ───────────────────────────────────────
export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("resumen");
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");

  // Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [licenses, setLicenses] = useState<LicenseInfo[]>([]);
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  // License generation
  const [genLevel, setGenLevel] = useState<LicenseLevel>("standard");
  const [genDuration, setGenDuration] = useState<LicenseDuration>(1);
  const [genCount, setGenCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Transaction filter
  const [txTypeFilter, setTxTypeFilter] = useState<string>("all");
  const [txStatusFilter, setTxStatusFilter] = useState<string>("all");

  // Edit states
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [editStatus, setEditStatus] = useState("");

  // ─── Auth guard ──────────────────────────────────────
  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login");
    if (status === "authenticated" && session?.user?.role !== "admin") router.push("/dashboard");
  }, [status, session, router]);

  // ─── Load data ───────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, uRes, lRes, aRes, tRes, cRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/users"),
        fetch("/api/licenses"),
        fetch("/api/admin/accounts"),
        fetch("/api/admin/transactions"),
        fetch("/api/admin/commissions"),
      ]);
      if (sRes.ok) setStats(await sRes.json());
      if (uRes.ok) setUsers((await uRes.json()).users ?? []);
      if (lRes.ok) setLicenses((await lRes.json()).licenses ?? []);
      if (aRes.ok) setAccounts((await aRes.json()).accounts ?? []);
      if (tRes.ok) setTransactions((await tRes.json()).transactions ?? []);
      if (cRes.ok) setCommissions((await cRes.json()).commissions ?? []);
    } catch {
      // silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === "admin") loadData();
  }, [session, loadData]);

  // ─── License actions ─────────────────────────────────
  async function generateLicenses() {
    setGenerating(true);
    try {
      const res = await fetch("/api/licenses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: genLevel, durationMonths: genDuration, count: genCount }),
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

  // ─── User role change ────────────────────────────────
  async function changeUserRole(userId: string, newRole: string) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setEditingUser(null);
    loadData();
  }

  // ─── Account update ──────────────────────────────────
  async function updateAccount(accountId: string) {
    const body: any = {};
    if (editBalance) body.balance = Number(editBalance);
    if (editStatus) body.status = editStatus;
    await fetch(`/api/admin/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditingAccount(null);
    setEditBalance("");
    setEditStatus("");
    loadData();
  }

  // ─── Transaction approve/reject ──────────────────────
  async function updateTransaction(txId: string, newStatus: string) {
    // We'll update via a direct query approach — create a simple endpoint
    // For now, update via the transactions table directly using a client-side call
    try {
      await fetch(`/api/admin/transactions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: txId, status: newStatus }),
      });
      loadData();
    } catch {
      // silently
    }
  }

  // ─── Mark commission paid ────────────────────────────
  async function markCommissionPaid(commissionId: string) {
    await fetch(`/api/admin/commissions/${commissionId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_method: "transferencia" }),
    });
    loadData();
  }

  // ─── Filtered data ───────────────────────────────────
  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredTx = transactions.filter((t) => {
    if (txTypeFilter !== "all" && t.type !== txTypeFilter) return false;
    if (txStatusFilter !== "all" && t.status !== txStatusFilter) return false;
    return true;
  });

  // ─── Loading state ───────────────────────────────────
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-x-hidden">
      <PremiumHeader
        variant="app"
        userName={session?.user?.email}
        userRole="admin"
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-24 pb-10 space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-zinc-400 mt-1">
            Gestiona usuarios, cuentas, transacciones, comisiones y licencias.
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                activeTab === tab.key
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── RESUMEN TAB ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "resumen" && stats && (
            <motion.div key="resumen" {...fadeUp} transition={{ duration: 0.3 }} className="space-y-6">
              <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" variants={stagger} initial="initial" animate="animate">
                {[
                  { label: "Usuarios Totales", value: stats.totalUsers, icon: Users, trend: "+12%", up: true },
                  { label: "Cuentas Activas", value: stats.activeAccounts, icon: Building2, trend: "+8%", up: true },
                  { label: "Balance Total", value: fmt(stats.totalBalance), icon: Wallet, trend: "+15%", up: true },
                  { label: "Comisiones Pend.", value: fmt(stats.pendingCommissions), icon: Clock, trend: "", up: false },
                  { label: "Depósitos del Mes", value: fmt(stats.depositsMonth), icon: ArrowUpRight, trend: "+22%", up: true },
                  { label: "Retiros del Mes", value: fmt(stats.withdrawalsMonth), icon: ArrowDownRight, trend: "-5%", up: false },
                ].map((stat, i) => (
                  <motion.div key={stat.label} variants={fadeUp}>
                    <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl hover:border-zinc-700 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <stat.icon className="w-5 h-5" />
                          </div>
                          {stat.trend && (
                            <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                              {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {stat.trend}
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-bold">{stat.value}</p>
                        <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Extra stats row */}
              <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Comisiones Pagadas</p>
                      <p className="text-lg font-bold">{fmt(stats.paidCommissions)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Transacciones Pendientes</p>
                      <p className="text-lg font-bold">{stats.pendingTransactions}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Depósitos Totales</p>
                      <p className="text-lg font-bold">{fmt(stats.totalDeposits)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── USUARIOS TAB ─────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "usuarios" && (
            <motion.div key="usuarios" {...fadeUp} transition={{ duration: 0.3 }}>
              <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="w-5 h-5 text-emerald-400" />
                      Usuarios Registrados
                    </CardTitle>
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        placeholder="Buscar por email o nombre..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="pl-9 h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl text-sm"
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
                          <TableHead className="text-zinc-400">Cuentas</TableHead>
                          <TableHead className="text-zinc-400">Balance</TableHead>
                          <TableHead className="text-zinc-400">Registro</TableHead>
                          <TableHead className="text-zinc-400">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => {
                          const userAccounts = accounts.filter((a) => a.user_id === u.id);
                          const userBalance = userAccounts.reduce((sum, a) => sum + a.balance, 0);
                          return (
                            <TableRow key={u.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                              <TableCell className="font-mono text-sm">{u.email}</TableCell>
                              <TableCell className="text-sm">{u.name || "—"}</TableCell>
                              <TableCell>
                                {editingUser === u.id ? (
                                  <Select
                                    value={u.role}
                                    onValueChange={(v) => changeUserRole(u.id, v)}
                                  >
                                    <SelectTrigger className="h-8 w-24 bg-zinc-800 border-zinc-700 rounded-lg text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700">
                                      <SelectItem value="user">user</SelectItem>
                                      <SelectItem value="admin">admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
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
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {u.brokerId || "—"}
                              </TableCell>
                              <TableCell className="text-sm">{userAccounts.length}</TableCell>
                              <TableCell className="text-sm font-semibold">
                                {userAccounts.length > 0 ? fmt(userBalance) : "—"}
                              </TableCell>
                              <TableCell className="text-sm text-zinc-400">
                                {fmtDate(u.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                                  onClick={() => setEditingUser(editingUser === u.id ? null : u.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredUsers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                              No se encontraron usuarios.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── CUENTAS TAB ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "cuentas" && (
            <motion.div key="cuentas" {...fadeUp} transition={{ duration: 0.3 }}>
              <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    Cuentas de Trading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                          <TableHead className="text-zinc-400">Usuario</TableHead>
                          <TableHead className="text-zinc-400">Broker</TableHead>
                          <TableHead className="text-zinc-400"># Cuenta</TableHead>
                          <TableHead className="text-zinc-400">Balance</TableHead>
                          <TableHead className="text-zinc-400">Equity</TableHead>
                          <TableHead className="text-zinc-400">P&L Diario</TableHead>
                          <TableHead className="text-zinc-400">P&L Total</TableHead>
                          <TableHead className="text-zinc-400">Trades</TableHead>
                          <TableHead className="text-zinc-400">Estado</TableHead>
                          <TableHead className="text-zinc-400">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((a) => (
                          <TableRow key={a.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                            <TableCell className="text-sm">
                              <p className="font-medium">{a.name || "—"}</p>
                              <p className="text-xs text-zinc-500">{a.email}</p>
                            </TableCell>
                            <TableCell className="text-sm">{a.broker_name}</TableCell>
                            <TableCell className="font-mono text-sm">{a.account_number ?? "—"}</TableCell>
                            <TableCell className="text-sm font-semibold">{fmt(a.balance)}</TableCell>
                            <TableCell className="text-sm">{fmt(a.equity)}</TableCell>
                            <TableCell className={`text-sm font-medium ${a.daily_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {fmt(a.daily_pnl)}
                            </TableCell>
                            <TableCell className={`text-sm font-medium ${a.total_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {fmt(a.total_pnl)}
                            </TableCell>
                            <TableCell className="text-sm">{a.open_trades}</TableCell>
                            <TableCell>{statusBadge(a.status)}</TableCell>
                            <TableCell>
                              {editingAccount === a.id ? (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={editBalance}
                                    onChange={(e) => setEditBalance(e.target.value)}
                                    placeholder="Balance"
                                    className="h-8 w-24 bg-zinc-800 border-zinc-700 rounded-lg text-xs"
                                  />
                                  <Select value={editStatus} onValueChange={setEditStatus}>
                                    <SelectTrigger className="h-8 w-28 bg-zinc-800 border-zinc-700 rounded-lg text-xs">
                                      <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700">
                                      <SelectItem value="active">Activa</SelectItem>
                                      <SelectItem value="pending">Pendiente</SelectItem>
                                      <SelectItem value="suspended">Suspendida</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    className="h-8 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-xs"
                                    onClick={() => updateAccount(a.id)}
                                  >
                                    OK
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                                  onClick={() => {
                                    setEditingAccount(a.id);
                                    setEditBalance(String(a.balance));
                                    setEditStatus(a.status);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {accounts.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-zinc-500 py-8">
                              No hay cuentas de trading.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── TRANSACCIONES TAB ────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "transacciones" && (
            <motion.div key="transacciones" {...fadeUp} transition={{ duration: 0.3 }} className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                  <SelectTrigger className="h-10 w-40 bg-zinc-800 border-zinc-700 rounded-xl text-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="deposito">Depósito</SelectItem>
                    <SelectItem value="retiro">Retiro</SelectItem>
                    <SelectItem value="comision">Comisión</SelectItem>
                    <SelectItem value="profit_share">Profit Share</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={txStatusFilter} onValueChange={setTxStatusFilter}>
                  <SelectTrigger className="h-10 w-40 bg-zinc-800 border-zinc-700 rounded-xl text-sm">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="rejected">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-xl"
                  onClick={() => { setTxTypeFilter("all"); setTxStatusFilter("all"); }}
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  Limpiar
                </Button>
                <span className="text-sm text-zinc-400">{filteredTx.length} transacciones</span>
              </div>

              <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                          <TableHead className="text-zinc-400">Usuario</TableHead>
                          <TableHead className="text-zinc-400">Tipo</TableHead>
                          <TableHead className="text-zinc-400">Monto</TableHead>
                          <TableHead className="text-zinc-400">Estado</TableHead>
                          <TableHead className="text-zinc-400">Descripción</TableHead>
                          <TableHead className="text-zinc-400">Referencia</TableHead>
                          <TableHead className="text-zinc-400">Fecha</TableHead>
                          <TableHead className="text-zinc-400">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTx.map((t) => (
                          <TableRow key={t.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                            <TableCell className="text-sm">
                              <p className="font-medium">{t.name || "—"}</p>
                              <p className="text-xs text-zinc-500">{t.email}</p>
                            </TableCell>
                            <TableCell>{txTypeBadge(t.type)}</TableCell>
                            <TableCell className={`text-sm font-semibold ${t.type === "deposito" || t.type === "profit_share" ? "text-emerald-400" : t.type === "retiro" || t.type === "comision" ? "text-red-400" : ""}`}>
                              {fmt(t.amount)}
                            </TableCell>
                            <TableCell>{statusBadge(t.status)}</TableCell>
                            <TableCell className="text-sm text-zinc-300 max-w-[200px] truncate">
                              {t.description || "—"}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-zinc-400">
                              {t.reference_id || "—"}
                            </TableCell>
                            <TableCell className="text-sm text-zinc-400">{fmtDate(t.created_at)}</TableCell>
                            <TableCell>
                              {t.status === "pending" && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                                    onClick={() => updateTransaction(t.id, "completed")}
                                    title="Aprobar"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-red-400 hover:bg-red-500/10 rounded-lg"
                                    onClick={() => updateTransaction(t.id, "rejected")}
                                    title="Rechazar"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredTx.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                              No hay transacciones.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Totals */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs text-zinc-400">Total Depósitos</p>
                      <p className="text-lg font-bold text-emerald-400">
                        {fmt(filteredTx.filter((t) => t.type === "deposito" && t.status === "completed").reduce((s, t) => s + t.amount, 0))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                    <div>
                      <p className="text-xs text-zinc-400">Total Retiros</p>
                      <p className="text-lg font-bold text-red-400">
                        {fmt(filteredTx.filter((t) => t.type === "retiro" && t.status === "completed").reduce((s, t) => s + t.amount, 0))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── COMISIONES TAB ───────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "comisiones" && (
            <motion.div key="comisiones" {...fadeUp} transition={{ duration: 0.3 }} className="space-y-4">
              {/* Summary */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-xs text-zinc-400">Total Pendiente</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {fmt(commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.commission_amount, 0))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs text-zinc-400">Total Pagado</p>
                      <p className="text-lg font-bold text-emerald-400">
                        {fmt(commissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.commission_amount, 0))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-zinc-800 hover:bg-transparent">
                          <TableHead className="text-zinc-400">Usuario</TableHead>
                          <TableHead className="text-zinc-400">Período</TableHead>
                          <TableHead className="text-zinc-400">Ganancia Bruta</TableHead>
                          <TableHead className="text-zinc-400">Tasa</TableHead>
                          <TableHead className="text-zinc-400">Monto Comisión</TableHead>
                          <TableHead className="text-zinc-400">Estado</TableHead>
                          <TableHead className="text-zinc-400">Fecha Pago</TableHead>
                          <TableHead className="text-zinc-400">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.map((c) => (
                          <TableRow key={c.id} className="border-zinc-800/50 hover:bg-zinc-800/30">
                            <TableCell className="text-sm">
                              <p className="font-medium">{c.name || "—"}</p>
                              <p className="text-xs text-zinc-500">{c.email}</p>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
                                {fmtDate(c.period_start)} — {fmtDate(c.period_end)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-semibold text-emerald-400">
                              {fmt(c.gross_profit)}
                            </TableCell>
                            <TableCell className="text-sm">{c.commission_rate}%</TableCell>
                            <TableCell className="text-sm font-semibold text-yellow-400">
                              {fmt(c.commission_amount)}
                            </TableCell>
                            <TableCell>{statusBadge(c.status)}</TableCell>
                            <TableCell className="text-sm text-zinc-400">
                              {c.paid_at ? fmtDate(c.paid_at) : "—"}
                            </TableCell>
                            <TableCell>
                              {c.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                                  onClick={() => markCommissionPaid(c.id)}
                                  title="Marcar como pagada"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {commissions.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-zinc-500 py-8">
                              No hay comisiones.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── LICENCIAS TAB ────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "licencias" && (
            <motion.div key="licencias" {...fadeUp} transition={{ duration: 0.3 }} className="space-y-6">
              <Card className="border-zinc-800 bg-zinc-900/50 rounded-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Key className="w-5 h-5 text-emerald-400" />
                      Gestión de Licencias
                    </CardTitle>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl min-h-[44px]">
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
                            <Select value={genLevel} onValueChange={(v) => setGenLevel(v as LicenseLevel)}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                {LICENSE_LEVELS.map((l) => (
                                  <SelectItem key={l} value={l}>{LICENSE_LEVEL_LABELS[l]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-zinc-300 mb-2 block">Duración</Label>
                            <Select value={String(genDuration)} onValueChange={(v) => setGenDuration(Number(v) as LicenseDuration)}>
                              <SelectTrigger className="bg-zinc-800 border-zinc-700 rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                {LICENSE_DURATIONS.map((d) => (
                                  <SelectItem key={d} value={String(d)}>{LICENSE_DURATION_LABELS[d]}</SelectItem>
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
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl min-h-[44px]"
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
                                <Badge variant="outline" className={lic.level === "pro" ? "text-cyan-400 border-cyan-500/30" : "text-zinc-400 border-zinc-600"}>
                                  {lic.level.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{lic.durationMonths} mes{lic.durationMonths > 1 ? "es" : ""}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`${cfg.color} border-current`}>{cfg.label}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-zinc-400">{lic.assignedToEmail || "—"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  {lic.status !== "revoked" && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" title="Revocar" onClick={() => revokeLicense(lic.id)}>
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {lic.status === "assigned" && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10" title="Pausar" onClick={() => pauseLicense(lic.id)}>
                                      <Pause className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {lic.status === "paused" && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" title="Reanudar" onClick={() => resumeLicense(lic.id)}>
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
