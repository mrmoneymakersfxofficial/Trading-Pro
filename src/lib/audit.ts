import { query } from "./db-pg";

export async function auditLog(params: {
  userId?: string;
  action: string;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    const id = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await query(
      `INSERT INTO audit_logs (id, "userId", action, details, "ipAddress", "createdAt")
       VALUES ($1, $2, $3, $4, $5, now())`,
      [id, params.userId ?? null, params.action, params.details ? JSON.stringify(params.details) : null, params.ipAddress ?? null]
    );
  } catch (err) {
    console.error("Audit log error:", err);
    // Don't fail the main operation
  }
}
