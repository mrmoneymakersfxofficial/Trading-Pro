import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db-pg";
import { generateLicenseKey } from "@/lib/licenses";
import { auditLog } from "@/lib/audit";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/payments/webhook — MercadoPago notification
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`webhook:${ip}`, 100, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  try {
    const body = await req.json();

    // MP sends notification with type and data.id
    if (body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const mpPaymentId = String(body.data?.id);
    if (!mpPaymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    // Fetch payment details from MP
    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      return NextResponse.json({ error: "MP not configured" }, { status: 503 });
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
      headers: { Authorization: `Bearer ${mpAccessToken}` },
    });

    if (!mpRes.ok) {
      console.error("MP fetch error:", mpRes.status);
      return NextResponse.json({ error: "MP fetch failed" }, { status: 502 });
    }

    const mpPayment = await mpRes.json();
    const status = mpPayment.status; // "approved", "rejected", "pending", "refunded"

    // Find our payment record by MP ID
    const payment = await queryOne(
      `SELECT * FROM payments WHERE "mercadoPagoId" = $1`,
      [mpPaymentId]
    );

    if (!payment) {
      console.error("Payment not found for MP ID:", mpPaymentId);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update payment status
    await query(
      `UPDATE payments SET status = $1, "updatedAt" = now() WHERE id = $2`,
      [status, payment.id]
    );

    // If approved and no license yet, generate and assign one
    if (status === "approved" && !payment.licenseId) {
      const licenseLevel = payment.licenseLevel;
      const licenseDuration = payment.licenseDuration;

      // Generate license key
      let key = generateLicenseKey();
      let existing = await queryOne("SELECT id FROM licenses WHERE key = $1", [key]);
      while (existing) {
        key = generateLicenseKey();
        existing = await queryOne("SELECT id FROM licenses WHERE key = $1", [key]);
      }

      const licenseId = `lic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await query(
        `INSERT INTO licenses (id, key, level, "durationMonths", status, "assignedToEmail", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'assigned', $5, now(), now())`,
        [licenseId, key, licenseLevel, licenseDuration, payment.payerEmail]
      );

      // Assign to user
      const now = new Date();
      const expiresAt = new Date(now.getTime() + licenseDuration * 30 * 24 * 60 * 60 * 1000);
      const ulId = `ul-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await query(
        `INSERT INTO user_licenses (id, "userId", "licenseId", "activatedAt", "expiresAt", status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 'active', now(), now())`,
        [ulId, payment.userId, licenseId, now.toISOString(), expiresAt.toISOString()]
      );

      // Update payment with license ID
      await query(
        `UPDATE payments SET "licenseId" = $1, "updatedAt" = now() WHERE id = $2`,
        [licenseId, payment.id]
      );

      await auditLog({
        userId: payment.userId,
        action: "payment_success",
        details: {
          paymentId: payment.id,
          mpPaymentId,
          licenseKey: key,
          licenseId,
          amount: payment.amount,
          level: licenseLevel,
          duration: licenseDuration,
        },
      });
    }

    return NextResponse.json({ received: true, status });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
