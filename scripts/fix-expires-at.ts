// Add expiresAt to licenses table
import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.bscpvmqbjhlbifwqypxx:Wafla0523129500@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    await client.query(`ALTER TABLE licenses ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMPTZ`);
    console.log("✅ Added expiresAt to licenses");

    const res = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'licenses' ORDER BY ordinal_position`
    );
    console.log("📋 licenses columns:", res.rows.map((r: any) => r.column_name).join(", "));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

main();
