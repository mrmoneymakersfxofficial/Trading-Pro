import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/licenses/mine — Obtener licencias del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        licenses: {
          include: { license: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const licenses = user.licenses.map((ul) => ({
      id: ul.id,
      licenseKey: ul.license.key,
      level: ul.license.level,
      status: ul.status,
      activatedAt: ul.activatedAt?.toISOString() ?? null,
      expiresAt: ul.expiresAt?.toISOString() ?? null,
    }));

    // Check and update expired licenses
    for (const ul of user.licenses) {
      if (ul.status === "active" && ul.expiresAt && new Date(ul.expiresAt) < new Date()) {
        await db.userLicense.update({
          where: { id: ul.id },
          data: { status: "expired" },
        });
        await db.license.update({
          where: { id: ul.licenseId },
          data: { status: "assigned" },
        });
      }
    }

    return NextResponse.json({ licenses });
  } catch (err) {
    console.error("Error fetching licenses:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
