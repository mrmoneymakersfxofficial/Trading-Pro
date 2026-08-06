import { NextResponse } from "next/server";
import { query } from "@/lib/db-pg";
import { getCurrentUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const commissions = await query(
      `SELECT * FROM commissions WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      commissions: commissions.map((c: any) => ({
        ...c,
        gross_profit: Number(c.gross_profit),
        commission_rate: Number(c.commission_rate),
        commission_amount: Number(c.commission_amount),
      })),
    });
  } catch (err) {
    console.error("Dashboard commissions error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
