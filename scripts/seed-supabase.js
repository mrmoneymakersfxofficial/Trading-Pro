const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.bscpvmqbjhlbifwqypxx:Wafla0523129500@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('🌱 Seeding Supabase...');

  // Admin user
  const adminPw = await bcrypt.hash('admin123', 12);
  await client.query(`
    INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, now(), now())
    ON CONFLICT (email) DO NOTHING
  `, ['admin-001', 'admin@tradingpro.com', 'Admin Trading Pro', adminPw, 'admin']);
  console.log('✅ Admin: admin@tradingpro.com');

  // Demo user
  const userPw = await bcrypt.hash('user123', 12);
  await client.query(`
    INSERT INTO users (id, email, name, password, role, "brokerId", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, now(), now())
    ON CONFLICT (email) DO NOTHING
  `, ['user-001', 'demo@tradingpro.com', 'Trader Demo', userPw, 'user', '12345678']);
  console.log('✅ User: demo@tradingpro.com');

  // Demo licenses
  const keys = [
    { key: 'TP-ABCD-1234-EFGH-5678', level: 'standard', duration: 1, status: 'assigned', email: 'demo@tradingpro.com' },
    { key: 'TP-PRO9-9999-LEVL-PRO1', level: 'pro', duration: 3, status: 'available', email: null },
    { key: 'TP-FREE-TEST-KEY1-NOW1', level: 'standard', duration: 6, status: 'available', email: null },
    { key: 'TP-PREM-IUM-12MO-NTHS', level: 'pro', duration: 12, status: 'available', email: null },
  ];

  for (const k of keys) {
    await client.query(`
      INSERT INTO licenses (id, key, level, "durationMonths", status, "assignedToEmail", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, now(), now())
      ON CONFLICT (key) DO NOTHING
    `, [`lic-${k.key.substring(4, 8).toLowerCase()}`, k.key, k.level, k.duration, k.status, k.email]);
    console.log('✅ License:', k.key);
  }

  // Assign license to demo user
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await client.query(`
    INSERT INTO user_licenses (id, "userId", "licenseId", "activatedAt", "expiresAt", status, "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, $6, now(), now())
    ON CONFLICT ("userId", "licenseId") DO NOTHING
  `, ['ul-001', 'user-001', 'lic-abcd', now.toISOString(), expiresAt.toISOString(), 'active']);
  console.log('✅ License assigned to demo user');

  // Audit log
  await client.query(`
    INSERT INTO audit_logs (id, action, details, "createdAt")
    VALUES ($1, $2, $3, now())
  `, ['audit-001', 'system_seed', '{"message":"Database seeded with demo data"}']);
  console.log('✅ Audit log created');

  console.log('🎉 Seed completed!');
  await client.end();
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
