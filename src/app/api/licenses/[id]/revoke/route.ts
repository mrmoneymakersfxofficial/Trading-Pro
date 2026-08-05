import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = await params;
  const license = await queryOne("SELECT * FROM licenses WHERE id = $1", [id]);
  if (!license) return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });

  await query(`UPDATE licenses SET status = 'revoked', "updatedAt" = now() WHERE id = $1`, [id]);
  await query(`UPDATE user_licenses SET status = 'revoked', "updatedAt" = now() WHERE "licenseId" = $1 AND status = 'active'`, [id]);

  await auditLog({ userId: session.user.id, action: "license_revoke", details: { licenseId: id, key: license.key } });
  return NextResponse.json({ message: "Licencia revocada." });
}
