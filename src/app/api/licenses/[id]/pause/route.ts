import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/licenses/[id]/pause — Pausar una licencia
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { id } = await params;
    const license = await db.license.findUnique({ where: { id } });
    if (!license) {
      return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
    }

    if (license.status === "revoked") {
      return NextResponse.json(
        { error: "No se puede pausar una licencia revocada." },
        { status: 400 }
      );
    }

    await db.license.update({
      where: { id },
      data: { status: "paused" },
    });

    await db.userLicense.updateMany({
      where: { licenseId: id, status: "active" },
      data: { status: "paused" },
    });

    return NextResponse.json({ message: "Licencia pausada." });
  } catch (err) {
    console.error("Pause error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
