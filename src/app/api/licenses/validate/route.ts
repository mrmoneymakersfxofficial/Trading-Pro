import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { validateLicenseSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/licenses/validate — Public endpoint for the trading bot
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`validate:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit excedido." }, { status: 429 });
  }

  try {
    const { key, brokerId } = await req.json();
    if (!key) {
      return NextResponse.json({ error: "Clave de licencia requerida." }, { status: 400 });
    }

    const license = await queryOne(
      `SELECT l.*, json_agg(ul.*) as "userLicenses" FROM licenses l LEFT JOIN user_licenses ul ON ul."licenseId" = l.id WHERE l.key = $1 GROUP BY l.id`,
      [key]
    );

    if (!license) {
      return NextResponse.json({ valid: false, error: "Clave no encontrada." }, { status: 404 });
    }

    const activeAssignment = (license.userLicenses || []).find((ul: any) => ul.status === "active");
    if (!activeAssignment) {
      return NextResponse.json({ valid: false, status: license.status, error: "No hay asignación activa." });
    }

    // Check expiration
    if (activeAssignment.expiresAt && new Date(activeAssignment.expiresAt) < new Date()) {
      await query(`UPDATE user_licenses SET status = 'expired' WHERE id = $1`, [activeAssignment.id]);
      return NextResponse.json({ valid: false, status: "expired", error: "Licencia expirada.", expiresAt: activeAssignment.expiresAt });
    }

    // Check broker ID
    if (brokerId) {
      const user = await queryOne(`SELECT "brokerId" FROM users WHERE id = $1`, [activeAssignment.userId]);
      if (user?.brokerId && user.brokerId !== brokerId) {
        return NextResponse.json({ valid: false, error: "Broker ID no coincide." });
      }
    }

    return NextResponse.json({
      valid: true,
      level: license.level,
      status: "active",
      expiresAt: activeAssignment.expiresAt?.toISOString?.() ?? activeAssignment.expiresAt,
      activatedAt: activeAssignment.activatedAt?.toISOString?.() ?? activeAssignment.activatedAt,
    });
  } catch (err) {
    console.error("Validate error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
