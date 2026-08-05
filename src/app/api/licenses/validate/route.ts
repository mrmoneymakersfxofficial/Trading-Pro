import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/licenses/validate — Validar una license key (público, para el bot)
export async function POST(req: NextRequest) {
  try {
    const { key, brokerId } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: "Debes proporcionar una clave de licencia." },
        { status: 400 }
      );
    }

    const license = await db.license.findUnique({
      where: { key },
      include: { userLicenses: true },
    });

    if (!license) {
      return NextResponse.json(
        { valid: false, error: "Clave no encontrada." },
        { status: 404 }
      );
    }

    // Buscar asignación activa
    const activeAssignment = license.userLicenses.find(
      (ul) => ul.status === "active"
    );

    if (!activeAssignment) {
      return NextResponse.json({
        valid: false,
        status: license.status,
        error: "No hay asignación activa para esta licencia.",
      });
    }

    // Verificar expiración
    if (activeAssignment.expiresAt && new Date(activeAssignment.expiresAt) < new Date()) {
      await db.userLicense.update({
        where: { id: activeAssignment.id },
        data: { status: "expired" },
      });
      return NextResponse.json({
        valid: false,
        status: "expired",
        error: "Licencia expirada.",
        expiresAt: activeAssignment.expiresAt.toISOString(),
      });
    }

    // Verificar broker ID si se proporciona
    if (brokerId) {
      const user = await db.user.findUnique({
        where: { id: activeAssignment.userId },
      });
      if (user?.brokerId && user.brokerId !== brokerId) {
        return NextResponse.json({
          valid: false,
          error: "Broker ID no coincide con el registrado.",
        });
      }
    }

    return NextResponse.json({
      valid: true,
      level: license.level,
      status: "active",
      expiresAt: activeAssignment.expiresAt?.toISOString() ?? null,
      activatedAt: activeAssignment.activatedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("Validate error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
