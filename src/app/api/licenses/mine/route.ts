import { NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/licenses/mine — Obtener licencias del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const licenses = await query(
      `SELECT ul.id, l.key as "licenseKey", l.level, ul.status,
              ul."activatedAt", ul."expiresAt"
       FROM user_licenses ul
       JOIN licenses l ON l.id = ul."licenseId"
       JOIN users u ON u.id = ul."userId"
       WHERE u.email = $1
       ORDER BY ul."createdAt" DESC`,
      [session.user.email]
    );

    // Check and update expired
    const now = new Date();
    for (const lic of licenses) {
      if (lic.status === "active" && lic.expiresAt && new Date(lic.expiresAt) < now) {
        await query(`UPDATE user_licenses SET status = 'expired' WHERE id = $1`, [lic.id]);
        lic.status = "expired";
      }
    }

    return NextResponse.json({ licenses });
  } catch (err) {
    console.error("Error fetching licenses:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
