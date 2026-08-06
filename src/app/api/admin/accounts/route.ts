import { NextResponse } from "next/server";
import { query } from "@/lib/db-pg";
import { getCurrentUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
    if (!user || (user.role !== "admin" && !adminEmails.includes(user.email))) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const accounts = await query(
      `SELECT ta.*, u.email, u.name 
       FROM trading_accounts ta 
       JOIN users u ON ta.user_id = u.id 
       ORDER BY ta.created_at DESC`
    );

    return NextResponse.json({
      accounts: accounts.map((a: any) => ({
        ...a,
        balance: Number(a.balance),
        equity: Number(a.equity),
        daily_pnl: Number(a.daily_pnl),
        total_pnl: Number(a.total_pnl),
      })),
    });
  } catch (err) {
    console.error("Admin accounts error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
