import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/users/me — Obtener datos del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, brokerId: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/users/me — Actualizar broker ID
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { brokerId } = await req.json();
    if (typeof brokerId !== "string") {
      return NextResponse.json(
        { error: "brokerId debe ser un string." },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { email: session.user.email },
      data: { brokerId: brokerId || null },
    });

    return NextResponse.json({ brokerId: user.brokerId });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
