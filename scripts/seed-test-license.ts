// Seed: insert a test license with bot-verification fields
import { Client } from "pg";

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.bscpvmqbjhlbifwqypxx:Wafla0523129500@aws-0-sa-east-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase\n");

    // Insert a test license with new bot fields
    const testKey = "TP-TEST-1234-5678-9ABC";

    // Check if already exists
    const existing = await client.query("SELECT id FROM licenses WHERE key = $1", [testKey]);
    if (existing.rows.length > 0) {
      // Update with new fields
      await client.query(`
        UPDATE licenses SET
          "clientName" = 'Juan Pérez',
          "clientEmail" = 'juan@test.com',
          status = 'active',
          "minBalanceUsd" = 600,
          "profitSharePercent" = 20,
          "expiresAt" = NOW() + INTERVAL '12 months',
          "updatedAt" = NOW()
        WHERE key = $1
      `, [testKey]);
      console.log("✅ Updated test license:", testKey);
    } else {
      await client.query(`
        INSERT INTO licenses (
          id, key, level, "durationMonths", status,
          "assignedToEmail", "clientName", "clientEmail",
          "minBalanceUsd", "profitSharePercent",
          "expiresAt", "createdAt", "updatedAt"
        ) VALUES (
          'lic-test-001', $1, 'pro', 12, 'active',
          'juan@test.com', 'Juan Pérez', 'juan@test.com',
          600, 20,
          NOW() + INTERVAL '12 months', NOW(), NOW()
        )
      `, [testKey]);
      console.log("✅ Created test license:", testKey);
    }

    // Also create one that is payment_due
    const payDueKey = "TP-DUE-AAAA-BBBB-CCCC";
    const existing2 = await client.query("SELECT id FROM licenses WHERE key = $1", [payDueKey]);
    if (existing2.rows.length === 0) {
      await client.query(`
        INSERT INTO licenses (
          id, key, level, "durationMonths", status,
          "assignedToEmail", "clientName", "clientEmail",
          "minBalanceUsd", "profitSharePercent",
          "expiresAt", "createdAt", "updatedAt"
        ) VALUES (
          'lic-due-001', $1, 'standard', 1, 'payment_due',
          'pedro@test.com', 'Pedro Gómez', 'pedro@test.com',
          600, 20,
          NOW() + INTERVAL '1 month', NOW(), NOW()
        )
      `, [payDueKey]);
      console.log("✅ Created payment_due license:", payDueKey);
    }

    // And one expired
    const expKey = "TP-EXP-DDDD-EEEE-FFFF";
    const existing3 = await client.query("SELECT id FROM licenses WHERE key = $1", [expKey]);
    if (existing3.rows.length === 0) {
      await client.query(`
        INSERT INTO licenses (
          id, key, level, "durationMonths", status,
          "assignedToEmail", "clientName", "clientEmail",
          "expiresAt", "createdAt", "updatedAt"
        ) VALUES (
          'lic-exp-001', $1, 'standard', 1, 'expired',
          'maria@test.com', 'María López', 'maria@test.com',
          NOW() - INTERVAL '1 day', NOW(), NOW()
        )
      `, [expKey]);
      console.log("✅ Created expired license:", expKey);
    }

    // Verify
    const res = await client.query(`
      SELECT key, status, "clientName", "machineId", "accountNumber", "expiresAt"
      FROM licenses WHERE key LIKE 'TP-TEST%' OR key LIKE 'TP-DUE%' OR key LIKE 'TP-EXP%'
    `);
    console.log("\n📋 Test licenses:");
    for (const row of res.rows) {
      console.log(`  ${row.key} | status: ${row.status} | client: ${row.clientName} | machine: ${row.machineId ?? 'none'} | expires: ${row.expiresAt}`);
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

main();
