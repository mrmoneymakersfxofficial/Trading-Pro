import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser, requireAuth, requireAdmin, isAdminUser } from "@/lib/auth-guard";
import { generateLicenseSchema } from "@/lib/validations";
import { generateLicenseKey } from "@/lib/licenses";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`genlic:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit excedido." }, { status: 429 });
  }

  try {
    const user = await getCurrentUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = generateLicenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { level, durationMonths, count } = parsed.data;
    const created = [];

    for (let i = 0; i < count; i++) {
      let key = generateLicenseKey();
      let existing = await queryOne("SELECT id FROM licenses WHERE key = $1", [key]);
      while (existing) {
        key = generateLicenseKey();
        existing = await queryOne("SELECT id FROM licenses WHERE key = $1", [key]);
      }

      const id = `lic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await query(
        `INSERT INTO licenses (id, key, level, "durationMonths", status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, 'available', now(), now())`,
        [id, key, level, durationMonths]
      );
      created.push({ id, key, level, durationMonths });
    }

    await auditLog({
      userId: user.id,
      action: "license_generate",
      details: { level, durationMonths, count, keys: created.map(c => c.key) },
      ipAddress: ip,
    });

    return NextResponse.json({ message: `${created.length} licencia(s) generada(s).`, licenses: created }, { status: 201 });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
