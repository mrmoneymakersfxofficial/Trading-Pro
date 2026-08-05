import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });

  const { id } = await params;
  const license = await queryOne("SELECT * FROM licenses WHERE id = $1", [id]);
  if (!license) return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
  if (license.status !== "paused") return NextResponse.json({ error: "Solo se pueden reanudar licencias pausadas." }, { status: 400 });

  const newStatus = license.assignedToEmail ? "assigned" : "available";
  await query(`UPDATE licenses SET status = $1, "updatedAt" = now() WHERE id = $2`, [newStatus, id]);
  await query(`UPDATE user_licenses SET status = 'active', "updatedAt" = now() WHERE "licenseId" = $1 AND status = 'paused'`, [id]);

  await auditLog({ userId: session.user.id, action: "license_resume", details: { licenseId: id, newStatus } });
  return NextResponse.json({ message: "Licencia reanudada." });
}
