import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser, requireAuth, requireAdmin } from "@/lib/auth-guard";
import { activateLicenseSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`activate:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un minuto." }, { status: 429 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    // Allow non-strict format for UX (just check it starts with TP-)
    const { key } = body;
    if (!key || typeof key !== "string" || !key.startsWith("TP-")) {
      return NextResponse.json({ error: "Clave de licencia inválida. Formato: TP-XXXX-XXXX-XXXX-XXXX" }, { status: 400 });
    }

    const license = await queryOne("SELECT * FROM licenses WHERE key = $1", [key.toUpperCase()]);
    if (!license) {
      return NextResponse.json({ error: "Clave de licencia no válida." }, { status: 404 });
    }

    if (license.status === "revoked") {
      return NextResponse.json({ error: "Esta licencia ha sido revocada." }, { status: 400 });
    }
    if (license.status === "paused") {
      return NextResponse.json({ error: "Esta licencia está pausada. Contacta al admin." }, { status: 400 });
    }
    if (license.status === "assigned" && license.assignedToEmail !== user.email) {
      return NextResponse.json({ error: "Esta licencia está asignada a otro usuario." }, { status: 403 });
    }
    if (license.status !== "available" && license.status !== "assigned") {
      return NextResponse.json({ error: `Licencia en estado "${license.status}", no se puede activar.` }, { status: 400 });
    }

    const dbUser = await queryOne("SELECT * FROM users WHERE email = $1", [user.email]);
    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    const existing = await queryOne(
      `SELECT id FROM user_licenses WHERE "userId" = $1 AND "licenseId" = $2 AND status = 'active'`,
      [dbUser.id, license.id]
    );
    if (existing) {
      return NextResponse.json({ error: "Ya tienes esta licencia activa." }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + license.durationMonths * 30 * 24 * 60 * 60 * 1000);
    const ulId = `ul-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await query(
      `INSERT INTO user_licenses (id, "userId", "licenseId", "activatedAt", "expiresAt", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, 'active', now(), now())`,
      [ulId, dbUser.id, license.id, now.toISOString(), expiresAt.toISOString()]
    );

    await query(
      `UPDATE licenses SET status = 'assigned', "assignedToEmail" = $1, "updatedAt" = now() WHERE id = $2`,
      [user.email, license.id]
    );

    await auditLog({
      userId: dbUser.id,
      action: "license_activate",
      details: { licenseKey: key, licenseId: license.id, expiresAt: expiresAt.toISOString() },
      ipAddress: ip,
    });

    return NextResponse.json({
      message: "Licencia activada exitosamente.",
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err) {
    console.error("Activate error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
