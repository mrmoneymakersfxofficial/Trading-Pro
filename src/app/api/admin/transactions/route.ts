import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser } from "@/lib/auth-guard";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
    if (!user || (user.role !== "admin" && !adminEmails.includes(user.email))) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID y estado requeridos" }, { status: 400 });
    }

    await query(
      `UPDATE transactions SET status = $1, processed_by = $2, processed_at = now(), updated_at = now() WHERE id = $3`,
      [status, user.email, id]
    );

    const updated = await queryOne("SELECT * FROM transactions WHERE id = $1", [id]);

    return NextResponse.json({
      transaction: { ...updated, amount: Number(updated?.amount ?? 0) },
    });
  } catch (err) {
    console.error("Admin transactions PATCH error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
    if (!user || (user.role !== "admin" && !adminEmails.includes(user.email))) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    let sql = `
      SELECT t.*, u.email, u.name 
      FROM transactions t 
      JOIN users u ON t.user_id = u.id 
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (type) {
      sql += ` AND t.type = $${idx++}`;
      params.push(type);
    }
    if (status) {
      sql += ` AND t.status = $${idx++}`;
      params.push(status);
    }
    if (dateFrom) {
      sql += ` AND t.created_at >= $${idx++}`;
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += ` AND t.created_at <= $${idx++}`;
      params.push(dateTo);
    }

    sql += " ORDER BY t.created_at DESC";

    const transactions = await query(sql, params);

    return NextResponse.json({
      transactions: transactions.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
      })),
    });
  } catch (err) {
    console.error("Admin transactions error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
