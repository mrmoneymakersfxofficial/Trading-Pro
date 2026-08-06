import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser, isAdminUser } from "@/lib/auth-guard";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await queryOne(
      `SELECT id, email, name, role, "brokerId", "createdAt", "updatedAt" FROM users WHERE id = $1`,
      [id]
    );

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Get user's trading accounts
    const accounts = await query(
      "SELECT * FROM trading_accounts WHERE user_id = $1 ORDER BY created_at DESC",
      [id]
    );

    // Get user's licenses
    const licenses = await query(
      `SELECT ul.*, l.key as "licenseKey", l.level, l."durationMonths"
       FROM user_licenses ul
       JOIN licenses l ON ul."licenseId" = l.id
       WHERE ul."userId" = $1
       ORDER BY ul."createdAt" DESC`,
      [id]
    );

    return NextResponse.json({
      user: targetUser,
      accounts: accounts.map((a: any) => ({
        ...a,
        balance: Number(a.balance),
        equity: Number(a.equity),
        daily_pnl: Number(a.daily_pnl),
        total_pnl: Number(a.total_pnl),
      })),
      licenses,
    });
  } catch (err) {
    console.error("Admin user GET error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { role, brokerId, name } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (role !== undefined) {
      updates.push(`role = $${idx++}`);
      values.push(role);
    }
    if (brokerId !== undefined) {
      updates.push(`"brokerId" = $${idx++}`);
      values.push(brokerId);
    }
    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    updates.push(`"updatedAt" = now()`);
    values.push(id);

    await query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${idx}`,
      values
    );

    const updated = await queryOne(
      `SELECT id, email, name, role, "brokerId" FROM users WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("Admin user PATCH error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
