import { NextResponse } from "next/server";
import { query } from "@/lib/db-pg";
import { getCurrentUser, isAdminUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const commissions = await query(
      `SELECT c.*, u.email, u.name 
       FROM commissions c 
       JOIN users u ON c.user_id = u.id 
       ORDER BY c.created_at DESC`
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
    console.error("Admin commissions error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
