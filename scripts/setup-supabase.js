const { Client } = require('pg');

const SQL = `
-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  image TEXT,
  role TEXT DEFAULT 'user',
  "brokerId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ─── LICENSES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  level TEXT DEFAULT 'standard',
  "durationMonths" INTEGER DEFAULT 1,
  status TEXT DEFAULT 'available',
  "assignedToEmail" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ─── USER_LICENSES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_licenses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "licenseId" TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  "activatedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("userId", "licenseId")
);

-- ─── AUDIT_LOGS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ─── PAYMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "mercadoPagoId" TEXT,
  status TEXT DEFAULT 'pending',
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'USD',
  "licenseLevel" TEXT NOT NULL,
  "licenseDuration" INTEGER NOT NULL,
  "licenseId" TEXT,
  "payerEmail" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_licenses_user ON user_licenses("userId");
CREATE INDEX IF NOT EXISTS idx_user_licenses_license ON user_licenses("licenseId");
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments("userId");
CREATE INDEX IF NOT EXISTS idx_payments_mp ON payments("mercadoPagoId");

-- ─── RLS POLICIES (Supabase Row Level Security) ─────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users FOR SELECT USING (auth.email() = email);

-- Users can update their own data
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.email() = email);

-- Users can read their own licenses
DROP POLICY IF EXISTS "user_licenses_read_own" ON user_licenses;
CREATE POLICY "user_licenses_read_own" ON user_licenses FOR SELECT USING ("userId" = (SELECT id FROM users WHERE email = auth.email()));

-- Users can read available licenses (for activation)
DROP POLICY IF EXISTS "licenses_read_available" ON licenses;
CREATE POLICY "licenses_read_available" ON licenses FOR SELECT USING (status = 'available' OR "assignedToEmail" = auth.email());

-- Service role full access (for admin operations)
DROP POLICY IF EXISTS "service_role_full" ON users;
CREATE POLICY "service_role_full" ON users FOR ALL USING (true) WITH CHECK (true);
`;

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.bscpvmqbjhlbifwqypxx:Wafla0523129500@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL');

  // Execute each statement separately for better error handling
  const statements = SQL.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    try {
      await client.query(stmt);
    } catch (e) {
      if (!e.message.includes('already exists')) {
        console.log('⚠️  Warning:', e.message.substring(0, 100));
      }
    }
  }

  console.log('✅ Schema created successfully');

  // Verify tables
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  console.log('📋 Tables:', res.rows.map(r => r.table_name).join(', '));

  await client.end();
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
