import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/licenses — Listar todas las licencias (solo admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const licenses = await db.license.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        key: true,
        level: true,
        durationMonths: true,
        status: true,
        assignedToEmail: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      licenses: licenses.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
