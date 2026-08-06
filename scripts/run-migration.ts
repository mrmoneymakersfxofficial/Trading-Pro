// Execute SQL migration on Supabase - individual statements
import { Client } from "pg";

const STATEMENTS = [
  // 1. Add new columns to licenses
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "clientName" TEXT`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "clientEmail" TEXT`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "machineId" TEXT`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "accountNumber" INTEGER`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "minBalanceUsd" NUMERIC DEFAULT 600`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "profitSharePercent" NUMERIC DEFAULT 20`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMPTZ`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "lastPaymentAmount" NUMERIC`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMPTZ`,
  `ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "notes" TEXT`,

  // 2. Drop old status constraint
  `ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_status_check`,

  // 3. Create license_checks table
  `CREATE TABLE IF NOT EXISTS license_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key TEXT NOT NULL,
    machine_id TEXT,
    account_number INTEGER,
    bot_version TEXT,
    status_returned TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,

  // 4. Indexes
  `CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses (key)`,
  `CREATE INDEX IF NOT EXISTS idx_license_checks_key ON license_checks (license_key)`,
  `CREATE INDEX IF NOT EXISTS idx_license_checks_created ON license_checks (created_at)`,
];

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.bscpvmqbjhlbifwqypxx:Wafla0523129500@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase PostgreSQL\n");

    for (let i = 0; i < STATEMENTS.length; i++) {
      const stmt = STATEMENTS[i];
      try {
        await client.query(stmt);
        console.log(`✅ [${i + 1}/${STATEMENTS.length}] ${stmt.substring(0, 90).replace(/\n/g, " ")}...`);
      } catch (err: any) {
        if (err.code === "42701") { // duplicate_column
          console.log(`⚠️  [${i + 1}] Skipped (column exists): ${stmt.substring(0, 60)}...`);
        } else if (err.code === "42P07") { // duplicate_table
          console.log(`⚠️  [${i + 1}] Skipped (table exists): ${stmt.substring(0, 60)}...`);
        } else {
          console.error(`❌ [${i + 1}] Error (${err.code}): ${err.message}`);
        }
      }
    }

    // Verify
    const res = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'licenses' ORDER BY ordinal_position`
    );
    console.log("\n📋 licenses columns:", res.rows.map((r: any) => r.column_name).join(", "));

    const res2 = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'license_checks' ORDER BY ordinal_position`
    );
    console.log("📋 license_checks columns:", res2.rows.map((r: any) => r.column_name).join(", "));

  } catch (err) {
    console.error("Fatal:", err);
  } finally {
    await client.end();
  }
}

main();
