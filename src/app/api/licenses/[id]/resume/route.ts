import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/licenses/[id]/resume — Reanudar una licencia pausada
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

    if (license.status !== "paused") {
      return NextResponse.json(
        { error: "Solo se pueden reanudar licencias pausadas." },
        { status: 400 }
      );
    }

    const newStatus = license.assignedToEmail ? "assigned" : "available";

    await db.license.update({
      where: { id },
      data: { status: newStatus },
    });

    await db.userLicense.updateMany({
      where: { licenseId: id, status: "paused" },
      data: { status: "active" },
    });

    return NextResponse.json({ message: "Licencia reanudada." });
  } catch (err) {
    console.error("Resume error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
