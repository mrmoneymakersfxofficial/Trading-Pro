import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateBrokerSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const user = await queryOne(
      `SELECT id, email, name, "brokerId", role FROM users WHERE email = $1`,
      [session.user.email]
    );
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const body = await req.json();
    const parsed = updateBrokerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

    await query(
      `UPDATE users SET "brokerId" = $1, "updatedAt" = now() WHERE email = $2`,
      [parsed.data.brokerId || null, session.user.email]
    );

    return NextResponse.json({ brokerId: parsed.data.brokerId || null });
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
