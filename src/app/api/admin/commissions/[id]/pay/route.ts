import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser, isAdminUser } from "@/lib/auth-guard";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { payment_method, notes } = body;

    // Check commission exists and is pending
    const commission = await queryOne(
      "SELECT * FROM commissions WHERE id = $1",
      [id]
    );

    if (!commission) {
      return NextResponse.json({ error: "Comisión no encontrada" }, { status: 404 });
    }

    if (commission.status === "paid") {
      return NextResponse.json({ error: "La comisión ya fue pagada" }, { status: 400 });
    }

    // Mark as paid
    await query(
      `UPDATE commissions SET status = 'paid', paid_at = now(), payment_method = $1, notes = $2, updated_at = now() WHERE id = $3`,
      [payment_method || "transferencia", notes || null, id]
    );

    // Also create a transaction for this payment
    const user_email = await queryOne<{ email: string }>(
      "SELECT email FROM users WHERE id = $1",
      [commission.user_id]
    );

    await query(
      `INSERT INTO transactions (id, user_id, trading_account_id, type, amount, currency, status, description, reference_id, processed_by, processed_at, created_at, updated_at)
       VALUES (gen_random_uuid()::text, $1, $2, 'comision', $3, 'USD', 'completed', $4, $5, $6, now(), now(), now())`,
      [
        commission.user_id,
        commission.trading_account_id,
        commission.commission_amount,
        `Comisión pagada - ${commission.period_start} a ${commission.period_end}`,
        `COM-PAY-${id.substring(0, 8)}`,
        user.email,
      ]
    );

    const updated = await queryOne(
      "SELECT * FROM commissions WHERE id = $1",
      [id]
    );

    return NextResponse.json({
      commission: {
        ...updated,
        gross_profit: Number(updated?.gross_profit ?? 0),
        commission_rate: Number(updated?.commission_rate ?? 0),
        commission_amount: Number(updated?.commission_amount ?? 0),
      },
    });
  } catch (err) {
    console.error("Commission pay error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
