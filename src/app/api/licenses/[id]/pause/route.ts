import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getCurrentUser, requireAuth, requireAdmin } from "@/lib/auth-guard";
import { auditLog } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = await params;
  const license = await queryOne("SELECT * FROM licenses WHERE id = $1", [id]);
  if (!license) return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  if (license.status === "revoked") return NextResponse.json({ error: "No se puede pausar una licencia revocada." }, { status: 400 });

  await query(`UPDATE licenses SET status = 'paused', "updatedAt" = now() WHERE id = $1`, [id]);
  await query(`UPDATE user_licenses SET status = 'paused', "updatedAt" = now() WHERE "licenseId" = $1 AND status = 'active'`, [id]);

  await auditLog({ userId: user.id, action: "license_pause", details: { licenseId: id } });
  return NextResponse.json({ message: "Licencia pausada." });
}
