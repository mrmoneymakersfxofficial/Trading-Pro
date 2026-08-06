import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Get user's trading accounts
    const accounts = await query(
      "SELECT * FROM trading_accounts WHERE user_id = $1 ORDER BY created_at DESC",
      [user.id]
    );

    // Get primary account (first active)
    const primaryAccount = accounts.find((a: any) => a.status === "active") || accounts[0];

    // Get pending commissions total
    const pendingCommissions = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(commission_amount), 0)::text as total FROM commissions WHERE user_id = $1 AND status = 'pending'",
      [user.id]
    );

    // Get paid commissions total
    const paidCommissions = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(commission_amount), 0)::text as total FROM commissions WHERE user_id = $1 AND status = 'paid'",
      [user.id]
    );

    // Get total deposits
    const totalDeposits = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(amount), 0)::text as total FROM transactions WHERE user_id = $1 AND type = 'deposito' AND status = 'completed'",
      [user.id]
    );

    // Get total withdrawals
    const totalWithdrawals = await queryOne<{ total: string }>(
      "SELECT COALESCE(SUM(amount), 0)::text as total FROM transactions WHERE user_id = $1 AND type = 'retiro' AND status = 'completed'",
      [user.id]
    );

    // Get account snapshots for primary account (last 30 days)
    let snapshots: any[] = [];
    if (primaryAccount) {
      snapshots = await query(
        `SELECT * FROM account_snapshots 
         WHERE trading_account_id = $1 AND captured_at >= now() - interval '30 days'
         ORDER BY captured_at ASC`,
        [primaryAccount.id]
      );
    }

    // Check if user has active license
    const activeLicense = await queryOne(
      `SELECT ul.* FROM user_licenses ul 
       JOIN licenses l ON ul."licenseId" = l.id
       WHERE ul."userId" = $1 AND ul.status = 'active'
       LIMIT 1`,
      [user.id]
    );

    return NextResponse.json({
      accounts: accounts.map((a: any) => ({
        ...a,
        balance: Number(a.balance),
        equity: Number(a.equity),
        daily_pnl: Number(a.daily_pnl),
        total_pnl: Number(a.total_pnl),
      })),
      primaryAccount: primaryAccount
        ? {
            ...primaryAccount,
            balance: Number(primaryAccount.balance),
            equity: Number(primaryAccount.equity),
            daily_pnl: Number(primaryAccount.daily_pnl),
            total_pnl: Number(primaryAccount.total_pnl),
          }
        : null,
      pendingCommissions: Number(pendingCommissions?.total ?? 0),
      paidCommissions: Number(paidCommissions?.total ?? 0),
      totalDeposits: Number(totalDeposits?.total ?? 0),
      totalWithdrawals: Number(totalWithdrawals?.total ?? 0),
      snapshots: snapshots.map((s: any) => ({
        ...s,
        balance: Number(s.balance),
        equity: Number(s.equity),
        daily_pnl: Number(s.daily_pnl),
      })),
      hasActiveLicense: !!activeLicense,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
