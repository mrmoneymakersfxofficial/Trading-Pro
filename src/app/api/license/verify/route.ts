// ─────────────────────────────────────────────────────────────
// POST /api/license/verify
// License verification endpoint for EA Trading Pro Bot (Python/MT5)
//
// Request body:
//   { license_key, machine_id, account_number, bot_version }
//
// Response statuses: active | payment_due | balance_low | expired | revoked | unauthorized
//
// IMPORTANT: balance_low is ONLY triggered by admin action or withdrawal webhook.
// Trading losses (drawdown) NEVER trigger balance_low.
// If balance drops to $50 by drawdown → license stays ACTIVE.
// If client withdraws and leaves < $250 → admin/webhook sets balance_low.
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase admin client (bypasses RLS) ──────────────────
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ─── In-memory rate limiter: 10 req/min per license_key ────
const rateMap = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateMap) {
    if (v.resetAt < now) rateMap.delete(k);
  }
}, 60_000);

function checkRateLimit(licenseKey: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(licenseKey);

  if (!entry || entry.resetAt < now) {
    rateMap.set(licenseKey, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 10) return false;

  entry.count++;
  return true;
}

// ─── Get client IP ─────────────────────────────────────────
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Log verification to license_checks ────────────────────
async function logCheck(
  supabase: ReturnType<typeof createClient>,
  data: {
    license_key: string;
    machine_id?: string;
    account_number?: number;
    bot_version?: string;
    status_returned: string;
    ip_address: string;
  }
) {
  try {
    await supabase.from("license_checks").insert({
      license_key: data.license_key,
      machine_id: data.machine_id ?? null,
      account_number: data.account_number ?? null,
      bot_version: data.bot_version ?? null,
      status_returned: data.status_returned,
      ip_address: data.ip_address,
    });
  } catch (err) {
    console.error("Failed to log license check:", err);
    // Don't fail the main operation
  }
}

// ─── Main handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const supabase = getSupabaseAdmin();

  try {
    // ── 1. Parse request body ─────────────────────────────
    const body = await req.json();
    const { license_key, machine_id, account_number, bot_version } = body;

    if (!license_key || typeof license_key !== "string") {
      return NextResponse.json(
        { status: "unauthorized", message: "license_key es obligatorio." },
        { status: 401 }
      );
    }

    // ── 2. Rate limit: 10 requests/min per license_key ────
    if (!checkRateLimit(license_key)) {
      return NextResponse.json(
        { status: "rate_limited", message: "Demasiadas verificaciones. Intenta en un minuto." },
        { status: 429 }
      );
    }

    // ── 3. Find license in Supabase ───────────────────────
    const { data: license, error: fetchError } = await supabase
      .from("licenses")
      .select("*")
      .eq("key", license_key.toUpperCase())
      .single();

    if (fetchError || !license) {
      await logCheck(supabase, {
        license_key,
        machine_id,
        account_number,
        bot_version,
        status_returned: "unauthorized",
        ip_address: ip,
      });

      return NextResponse.json(
        { status: "unauthorized", message: "Clave de licencia no válida." },
        { status: 401 }
      );
    }

    // ── 4. Check non-active statuses ──────────────────────
    // These statuses block the bot immediately
    const blockingStatuses = ["revoked", "expired", "payment_due", "balance_low"];

    if (blockingStatuses.includes(license.status)) {
      const messages: Record<string, string> = {
        revoked: "Licencia cancelada. Contactar a soporte.",
        expired: "Licencia vencida. Renovar para continuar.",
        payment_due: "Pago del 20% pendiente. Regularizar para reactivar.",
        balance_low: "Saldo operativo insuficiente tras retiro. Deposite fondos para reactivar el algoritmo.",
      };

      await logCheck(supabase, {
        license_key,
        machine_id,
        account_number,
        bot_version,
        status_returned: license.status,
        ip_address: ip,
      });

      return NextResponse.json({
        status: license.status,
        message: messages[license.status] ?? "Licencia no activa.",
      });
    }

    // ── 5. License is active — verify machine binding ─────
    if (license.status === "active" || license.status === "assigned" || license.status === "available") {
      // a) First activation: machine_id is NULL → bind it
      if (!license.machineId) {
        const { error: bindError } = await supabase
          .from("licenses")
          .update({
            machineId: machine_id ?? null,
            accountNumber: account_number ?? null,
            status: "active",
          })
          .eq("id", license.id);

        if (bindError) {
          console.error("Failed to bind machine:", bindError);
        }

        await logCheck(supabase, {
          license_key,
          machine_id,
          account_number,
          bot_version,
          status_returned: "active",
          ip_address: ip,
        });

        return NextResponse.json({
          status: "active",
          client_name: license.clientName ?? license.assignedToEmail ?? "",
          message: "Licencia activada y vinculada a este dispositivo.",
          expires_at: license.expiresAt ?? null,
          profit_share_percent: Number(license.profitSharePercent ?? 20),
          min_balance_usd: Number(license.minBalanceUsd ?? 250),
        });
      }

      // b) machine_id mismatch → different device
      if (machine_id && license.machineId !== machine_id) {
        await logCheck(supabase, {
          license_key,
          machine_id,
          account_number,
          bot_version,
          status_returned: "revoked",
          ip_address: ip,
        });

        return NextResponse.json(
          {
            status: "revoked",
            message: "Licencia vinculada a otro dispositivo. Contactar a soporte.",
          },
          { status: 403 }
        );
      }

      // c) account_number mismatch → different broker account
      if (account_number && license.accountNumber && license.accountNumber !== account_number) {
        await logCheck(supabase, {
          license_key,
          machine_id,
          account_number,
          bot_version,
          status_returned: "revoked",
          ip_address: ip,
        });

        return NextResponse.json(
          {
            status: "revoked",
            message: "Licencia vinculada a otra cuenta de broker. Contactar a soporte.",
          },
          { status: 403 }
        );
      }

      // d) Check if expired by date
      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        await supabase
          .from("licenses")
          .update({ status: "expired" })
          .eq("id", license.id);

        await logCheck(supabase, {
          license_key,
          machine_id,
          account_number,
          bot_version,
          status_returned: "expired",
          ip_address: ip,
        });

        return NextResponse.json({
          status: "expired",
          message: "Licencia vencida. Renovar para continuar.",
        });
      }

      // e) Everything OK — license is active and valid
      await logCheck(supabase, {
        license_key,
        machine_id,
        account_number,
        bot_version,
        status_returned: "active",
        ip_address: ip,
      });

      return NextResponse.json({
        status: "active",
        client_name: license.clientName ?? license.assignedToEmail ?? "",
        message: "Licencia activa.",
        expires_at: license.expiresAt ?? null,
        profit_share_percent: Number(license.profitSharePercent ?? 20),
        min_balance_usd: Number(license.minBalanceUsd ?? 250),
      });
    }

    // ── Fallback: unknown status ──────────────────────────
    await logCheck(supabase, {
      license_key,
      machine_id,
      account_number,
      bot_version,
      status_returned: license.status,
      ip_address: ip,
    });

    return NextResponse.json({
      status: license.status,
      message: `Licencia en estado: ${license.status}.`,
    });

  } catch (err) {
    console.error("License verify error:", err);
    return NextResponse.json(
      { status: "error", message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
