import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser } from "@/lib/auth-guard";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
    if (!user || (user.role !== "admin" && !adminEmails.includes(user.email))) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { balance, equity, daily_pnl, total_pnl, open_trades, status, account_number, broker_name, account_type, leverage } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (balance !== undefined) {
      updates.push(`balance = $${idx++}`);
      values.push(balance);
    }
    if (equity !== undefined) {
      updates.push(`equity = $${idx++}`);
      values.push(equity);
    }
    if (daily_pnl !== undefined) {
      updates.push(`daily_pnl = $${idx++}`);
      values.push(daily_pnl);
    }
    if (total_pnl !== undefined) {
      updates.push(`total_pnl = $${idx++}`);
      values.push(total_pnl);
    }
    if (open_trades !== undefined) {
      updates.push(`open_trades = $${idx++}`);
      values.push(open_trades);
    }
    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (account_number !== undefined) {
      updates.push(`account_number = $${idx++}`);
      values.push(account_number);
    }
    if (broker_name !== undefined) {
      updates.push(`broker_name = $${idx++}`);
      values.push(broker_name);
    }
    if (account_type !== undefined) {
      updates.push(`account_type = $${idx++}`);
      values.push(account_type);
    }
    if (leverage !== undefined) {
      updates.push(`leverage = $${idx++}`);
      values.push(leverage);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    updates.push(`updated_at = now()`);
    values.push(id);

    await query(
      `UPDATE trading_accounts SET ${updates.join(", ")} WHERE id = $${idx}`,
      values
    );

    const updated = await queryOne(
      "SELECT * FROM trading_accounts WHERE id = $1",
      [id]
    );

    return NextResponse.json({
      account: {
        ...updated,
        balance: Number(updated?.balance ?? 0),
        equity: Number(updated?.equity ?? 0),
        daily_pnl: Number(updated?.daily_pnl ?? 0),
        total_pnl: Number(updated?.total_pnl ?? 0),
      },
    });
  } catch (err) {
    console.error("Admin account PATCH error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
