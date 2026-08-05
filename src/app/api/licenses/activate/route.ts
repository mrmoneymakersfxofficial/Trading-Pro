import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/licenses/activate — Activar una license key
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { key } = await req.json();
    if (!key) {
      return NextResponse.json(
        { error: "Debes proporcionar una clave de licencia." },
        { status: 400 }
      );
    }

    // Buscar la licencia
    const license = await db.license.findUnique({ where: { key } });
    if (!license) {
      return NextResponse.json(
        { error: "Clave de licencia no válida." },
        { status: 404 }
      );
    }

    // Validar estado
    if (license.status === "revoked") {
      return NextResponse.json(
        { error: "Esta licencia ha sido revocada y no puede activarse." },
        { status: 400 }
      );
    }
    if (license.status === "assigned" && license.assignedToEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Esta licencia está asignada a otro usuario." },
        { status: 403 }
      );
    }
    if (license.status === "paused") {
      return NextResponse.json(
        { error: "Esta licencia está pausada. Contacta al administrador." },
        { status: 400 }
      );
    }
    if (license.status !== "available" && license.status !== "assigned") {
      return NextResponse.json(
        { error: `Licencia en estado "${license.status}", no se puede activar.` },
        { status: 400 }
      );
    }

    // Obtener usuario
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    // Verificar si ya tiene esta licencia activa
    const existing = await db.userLicense.findFirst({
      where: { userId: user.id, licenseId: license.id, status: "active" },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya tienes esta licencia activada." },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + license.durationMonths * 30 * 24 * 60 * 60 * 1000
    );

    // Crear asignación
    await db.userLicense.create({
      data: {
        userId: user.id,
        licenseId: license.id,
        status: "active",
        activatedAt: now,
        expiresAt,
      },
    });

    // Actualizar licencia
    await db.license.update({
      where: { id: license.id },
      data: {
        status: "assigned",
        assignedToEmail: session.user.email,
      },
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
