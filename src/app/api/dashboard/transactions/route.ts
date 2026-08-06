import { NextResponse } from "next/server";
import { query } from "@/lib/db-pg";
import { getCurrentUser } from "@/lib/auth-guard";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let sql = `
      SELECT * FROM transactions 
      WHERE user_id = $1
    `;
    const params: any[] = [user.id];
    let idx = 2;

    if (type) {
      sql += ` AND type = $${idx++}`;
      params.push(type);
    }
    if (status) {
      sql += ` AND status = $${idx++}`;
      params.push(status);
    }

    sql += " ORDER BY created_at DESC";

    const transactions = await query(sql, params);

    return NextResponse.json({
      transactions: transactions.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
      })),
    });
  } catch (err) {
    console.error("Dashboard transactions error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
