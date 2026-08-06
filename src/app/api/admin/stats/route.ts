import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
    if (!user || (user.role !== "admin" && !adminEmails.includes(user.email))) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Total users
    const totalUsers = await queryOne<{ count: string }>("SELECT COUNT(*)::text as count FROM users");

    // Active users this month
    const activeUsersMonth = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM users WHERE "createdAt" >= date_trunc('month', now())`
    );

    // Total trading accounts
    const totalAccounts = await queryOne<{ count: string }>(
      "SELECT COUNT(*)::text as count FROM trading_accounts"
    );

    // Active accounts
    const activeAccounts = await queryOne<{ count: string }>(
      "SELECT COUNT(*)::text as count FROM trading_accounts WHERE status = 'active'"
    );

    // Total balance across all accounts
    const totalBalance = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(balance), 0)::text as total FROM trading_accounts WHERE status = 'active'"
    );

    // Total commissions pending
    const pendingCommissions = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(commission_amount), 0)::text as total FROM commissions WHERE status = 'pending'"
    );

    // Total commissions paid
    const paidCommissions = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(commission_amount), 0)::text as total FROM commissions WHERE status = 'paid'"
    );

    // Total deposits this month
    const depositsMonth = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0)::text as total FROM transactions WHERE type = 'deposito' AND status = 'completed' AND created_at >= date_trunc('month', now())`
    );

    // Total withdrawals this month
    const withdrawalsMonth = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0)::text as total FROM transactions WHERE type = 'retiro' AND status = 'completed' AND created_at >= date_trunc('month', now())`
    );

    // Total deposits all time
    const totalDeposits = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(amount), 0)::text as total FROM transactions WHERE type = 'deposito' AND status = 'completed'"
    );

    // Total withdrawals all time
    const totalWithdrawals = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(amount), 0)::text as total FROM transactions WHERE type = 'retiro' AND status = 'completed'"
    );

    // Pending transactions count
    const pendingTransactions = await queryOne<{ count: string }>(
      "SELECT COUNT(*)::text as count FROM transactions WHERE status = 'pending'"
    );

    return NextResponse.json({
      totalUsers: Number(totalUsers?.count ?? 0),
      activeUsersMonth: Number(activeUsersMonth?.count ?? 0),
      totalAccounts: Number(totalAccounts?.count ?? 0),
      activeAccounts: Number(activeAccounts?.count ?? 0),
      totalBalance: Number(totalBalance?.total ?? 0),
      pendingCommissions: Number(pendingCommissions?.total ?? 0),
      paidCommissions: Number(paidCommissions?.total ?? 0),
      depositsMonth: Number(depositsMonth?.total ?? 0),
      withdrawalsMonth: Number(withdrawalsMonth?.total ?? 0),
      totalDeposits: Number(totalDeposits?.total ?? 0),
      totalWithdrawals: Number(totalWithdrawals?.total ?? 0),
      pendingTransactions: Number(pendingTransactions?.count ?? 0),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
