import { NextResponse } from "next/server";
import { query } from "@/lib/db-pg";
import { getCurrentUser, requireAuth, requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const licenses = await query(
      `SELECT id, key, level, "durationMonths", status, "assignedToEmail", "createdAt" FROM licenses ORDER BY "createdAt" DESC`
    );

    return NextResponse.json({
      licenses: licenses.map((l: any) => ({
        ...l,
        createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
      })),
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
