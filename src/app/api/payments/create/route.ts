import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPaymentSchema } from "@/lib/validations";
import { auditLog } from "@/lib/audit";

// Pricing in USD
const PRICES: Record<string, Record<number, number>> = {
  standard: { 1: 49, 3: 129, 6: 239, 12: 399 },
  pro: { 1: 99, 3: 269, 6: 499, 12: 799 },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { licenseLevel, licenseDuration } = parsed.data;
    const amount = PRICES[licenseLevel]?.[licenseDuration];
    if (!amount) {
      return NextResponse.json({ error: "Plan no válido." }, { status: 400 });
    }

    const user = await queryOne("SELECT id FROM users WHERE email = $1", [session.user.email]);
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // Create MercadoPago preference
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      return NextResponse.json({ error: "MercadoPago no configurado." }, { status: 503 });
    }

    const paymentId = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Store payment in DB
    await query(
      `INSERT INTO payments (id, "userId", status, amount, currency, "licenseLevel", "licenseDuration", "payerEmail", "createdAt", "updatedAt")
       VALUES ($1, $2, 'pending', $3, 'USD', $4, $5, $6, now(), now())`,
      [paymentId, user.id, amount, licenseLevel, licenseDuration, session.user.email]
    );

    // Create MP preference
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: paymentId,
            title: `Trading Pro — ${licenseLevel.toUpperCase()} ${licenseDuration} mes${licenseDuration > 1 ? "es" : ""}`,
            description: `Licencia ${licenseLevel.toUpperCase()} para Trading Pro Bot`,
            quantity: 1,
            unit_price: amount,
            currency_id: "USD",
          },
        ],
        payer: { email: session.user.email },
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
          failure: `${process.env.NEXTAUTH_URL}/dashboard?payment=failure`,
          pending: `${process.env.NEXTAUTH_URL}/dashboard?payment=pending`,
        },
        notification_url: `${process.env.NEXTAUTH_URL}/api/payments/webhook`,
        metadata: {
          payment_id: paymentId,
          user_id: user.id,
          license_level: licenseLevel,
          license_duration: licenseDuration,
        },
      }),
    });

    const mpData = await mpRes.json();

    if (!mpRes.ok) {
      console.error("MP Error:", mpData);
      return NextResponse.json({ error: "Error al crear pago en MercadoPago." }, { status: 502 });
    }

    // Update payment with MP ID
    await query(
      `UPDATE payments SET "mercadoPagoId" = $1, "updatedAt" = now() WHERE id = $2`,
      [String(mpData.id), paymentId]
    );

    await auditLog({
      userId: user.id,
      action: "payment_created",
      details: { paymentId, amount, licenseLevel, licenseDuration, mpPreferenceId: mpData.id },
    });

    return NextResponse.json({
      paymentId,
      initPoint: mpData.init_point, // URL to redirect user to MP checkout
      sandboxInitPoint: mpData.sandbox_init_point,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
