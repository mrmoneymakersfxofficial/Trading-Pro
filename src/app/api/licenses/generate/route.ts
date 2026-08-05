import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateLicenseKey } from "@/lib/licenses";

// POST /api/licenses/generate — Generar licencias (solo admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { level, durationMonths, count } = await req.json();

    if (!level || !durationMonths || !count) {
      return NextResponse.json(
        { error: "level, durationMonths y count son obligatorios." },
        { status: 400 }
      );
    }

    if (!["standard", "pro"].includes(level)) {
      return NextResponse.json(
        { error: "level debe ser 'standard' o 'pro'." },
        { status: 400 }
      );
    }

    if (![1, 3, 6, 12].includes(durationMonths)) {
      return NextResponse.json(
        { error: "durationMonths debe ser 1, 3, 6 o 12." },
        { status: 400 }
      );
    }

    const safeCount = Math.max(1, Math.min(50, Number(count)));
    const created = [];

    for (let i = 0; i < safeCount; i++) {
      let key = generateLicenseKey();
      // Asegurar unicidad
      let existing = await db.license.findUnique({ where: { key } });
      while (existing) {
        key = generateLicenseKey();
        existing = await db.license.findUnique({ where: { key } });
      }

      const license = await db.license.create({
        data: {
          key,
          level,
          durationMonths,
          status: "available",
        },
      });
      created.push(license);
    }

    return NextResponse.json(
      { message: `${created.length} licencia(s) generada(s).`, licenses: created },
      { status: 201 }
    );
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
