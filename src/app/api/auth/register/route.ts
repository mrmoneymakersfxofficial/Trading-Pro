import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per minute
  const ip = getClientIp(req);
  const rl = rateLimit(`register:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta en un minuto." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con este email." }, { status: 409 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim());
    const role = adminEmails.includes(email) ? "admin" : "user";
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await query(
      `INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, now(), now())`,
      [id, email, name, hashedPassword, role]
    );

    await auditLog({ userId: id, action: "register", details: { email, role }, ipAddress: ip });

    return NextResponse.json({ message: "Cuenta creada exitosamente.", id }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
