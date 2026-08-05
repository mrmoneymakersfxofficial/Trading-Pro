import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser, requireAuth, requireAdmin } from "@/lib/auth-guard";
import { updateBrokerSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const dbUser = await queryOne(
      `SELECT id, email, name, "brokerId", role FROM users WHERE email = $1`,
      [user.email]
    );
    if (!dbUser) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    return NextResponse.json(dbUser);
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const body = await req.json();
    const parsed = updateBrokerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    await query(
      `UPDATE users SET "brokerId" = $1, "updatedAt" = now() WHERE email = $2`,
      [parsed.data.brokerId || null, user.email]
    );

    return NextResponse.json({ brokerId: parsed.data.brokerId || null });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
