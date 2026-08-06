const { Client } = require('pg');

const SQL = `
-- ─── TRADING ACCOUNTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS trading_accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broker_name TEXT DEFAULT 'ICMarkets',
  account_number BIGINT,
  account_type TEXT DEFAULT 'standard',
  leverage TEXT DEFAULT '1:500',
  base_currency TEXT DEFAULT 'USD',
  balance DECIMAL(12,2) DEFAULT 0,
  equity DECIMAL(12,2) DEFAULT 0,
  daily_pnl DECIMAL(12,2) DEFAULT 0,
  total_pnl DECIMAL(12,2) DEFAULT 0,
  open_trades INT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── TRANSACTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trading_account_id TEXT REFERENCES trading_accounts(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  description TEXT,
  reference_id TEXT,
  processed_by TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── COMMISSIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS commissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trading_account_id TEXT REFERENCES trading_accounts(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_profit DECIMAL(12,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 20,
  commission_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── ACCOUNT SNAPSHOTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS account_snapshots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  trading_account_id TEXT NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) NOT NULL,
  equity DECIMAL(12,2) NOT NULL,
  daily_pnl DECIMAL(12,2) DEFAULT 0,
  open_trades INT DEFAULT 0,
  captured_at TIMESTAMPTZ DEFAULT now()
);

-- ─── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user ON trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status ON trading_accounts(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_account_snapshots_account ON account_snapshots(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_account_snapshots_captured ON account_snapshots(captured_at);
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
      console.log('✓ Executed:', stmt.substring(0, 60).replace(/\n/g, ' ') + '...');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  Already exists, skipping:', stmt.substring(0, 50).replace(/\n/g, ' ') + '...');
      } else {
        console.log('⚠️  Warning:', e.message.substring(0, 150));
      }
    }
  }

  console.log('✅ Business tables created successfully');

  // Verify tables
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  console.log('📋 All tables:', res.rows.map(r => r.table_name).join(', '));

  await client.end();
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
