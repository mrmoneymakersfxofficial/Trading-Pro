import { NextResponse } from "next/server";
import { query } from "@/lib/db-pg";
import { getCurrentUser, requireAuth, requireAdmin, isAdminUser } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const users = await query(
      `SELECT id, email, name, role, "brokerId", "createdAt" FROM users ORDER BY "createdAt" DESC`
    );

    return NextResponse.json({
      users: users.map((u: any) => ({
        ...u,
        createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
