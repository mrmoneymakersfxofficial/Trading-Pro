const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.bscpvmqbjhlbifwqypxx:Wafla0523129500@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('🌱 Seeding business data...');

  // ─── Trading Accounts ─────────────────────────────────
  const accounts = [
    { id: 'ta-001', user_id: 'admin-001', broker_name: 'ICMarkets', account_number: 50123456, account_type: 'standard', leverage: '1:500', base_currency: 'USD', balance: 12500.00, equity: 13280.50, daily_pnl: 145.30, total_pnl: 2780.50, open_trades: 3, status: 'active' },
    { id: 'ta-002', user_id: 'user-001', broker_name: 'ICMarkets', account_number: 60789123, account_type: 'pro', leverage: '1:500', base_currency: 'USD', balance: 8500.00, equity: 8920.75, daily_pnl: -85.20, total_pnl: 420.75, open_trades: 2, status: 'active' },
    { id: 'ta-003', user_id: 'user-001', broker_name: 'Exness', account_number: 70234567, account_type: 'standard', leverage: '1:2000', base_currency: 'USD', balance: 3200.00, equity: 3150.00, daily_pnl: -50.00, total_pnl: -50.00, open_trades: 1, status: 'active' },
    { id: 'ta-004', user_id: 'user-1786042730290-fao8b', broker_name: 'ICMarkets', account_number: 80912345, account_type: 'standard', leverage: '1:500', base_currency: 'USD', balance: 6800.00, equity: 7100.25, daily_pnl: 200.50, total_pnl: 300.25, open_trades: 4, status: 'active' },
  ];

  for (const a of accounts) {
    await client.query(`
      INSERT INTO trading_accounts (id, user_id, broker_name, account_number, account_type, leverage, base_currency, balance, equity, daily_pnl, total_pnl, open_trades, status, last_sync_at, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,now(),now(),now())
      ON CONFLICT (id) DO NOTHING
    `, [a.id, a.user_id, a.broker_name, a.account_number, a.account_type, a.leverage, a.base_currency, a.balance, a.equity, a.daily_pnl, a.total_pnl, a.open_trades, a.status]);
    console.log('✅ Trading account:', a.account_number);
  }

  // ─── Transactions ─────────────────────────────────────
  const transactions = [
    { id: 'txn-001', user_id: 'admin-001', trading_account_id: 'ta-001', type: 'deposito', amount: 10000, status: 'completed', description: 'Depósito inicial', reference_id: 'DEP-001' },
    { id: 'txn-002', user_id: 'admin-001', trading_account_id: 'ta-001', type: 'deposito', amount: 2500, status: 'completed', description: 'Depósito adicional', reference_id: 'DEP-002' },
    { id: 'txn-003', user_id: 'admin-001', trading_account_id: 'ta-001', type: 'comision', amount: 556.10, status: 'completed', description: 'Comisión 20% - Enero 2025', reference_id: 'COM-001' },
    { id: 'txn-004', user_id: 'admin-001', trading_account_id: 'ta-001', type: 'profit_share', amount: 2780.50, status: 'completed', description: 'Profit share - Enero 2025', reference_id: 'PS-001' },
    { id: 'txn-005', user_id: 'user-001', trading_account_id: 'ta-002', type: 'deposito', amount: 8500, status: 'completed', description: 'Depósito inicial', reference_id: 'DEP-003' },
    { id: 'txn-006', user_id: 'user-001', trading_account_id: 'ta-002', type: 'retiro', amount: 500, status: 'completed', description: 'Retiro parcial', reference_id: 'WIT-001' },
    { id: 'txn-007', user_id: 'user-001', trading_account_id: 'ta-002', type: 'comision', amount: 84.15, status: 'pending', description: 'Comisión 20% - Feb 2025', reference_id: 'COM-002' },
    { id: 'txn-008', user_id: 'user-001', trading_account_id: 'ta-003', type: 'deposito', amount: 3200, status: 'completed', description: 'Depósito inicial Exness', reference_id: 'DEP-004' },
    { id: 'txn-009', user_id: 'user-1786042730290-fao8b', trading_account_id: 'ta-004', type: 'deposito', amount: 6800, status: 'completed', description: 'Depósito inicial', reference_id: 'DEP-005' },
    { id: 'txn-010', user_id: 'user-1786042730290-fao8b', trading_account_id: 'ta-004', type: 'deposito', amount: 2000, status: 'pending', description: 'Depósito pendiente', reference_id: 'DEP-006' },
  ];

  for (const t of transactions) {
    await client.query(`
      INSERT INTO transactions (id, user_id, trading_account_id, type, amount, currency, status, description, reference_id, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,'USD',$6,$7,$8,now(),now())
      ON CONFLICT (id) DO NOTHING
    `, [t.id, t.user_id, t.trading_account_id, t.type, t.amount, t.status, t.description, t.reference_id]);
    console.log('✅ Transaction:', t.type, t.amount);
  }

  // ─── Commissions ──────────────────────────────────────
  const commissions = [
    { id: 'com-001', user_id: 'admin-001', trading_account_id: 'ta-001', period_start: '2025-01-01', period_end: '2025-01-31', gross_profit: 2780.50, commission_rate: 20, commission_amount: 556.10, status: 'paid', paid_at: '2025-02-01', payment_method: 'transferencia' },
    { id: 'com-002', user_id: 'admin-001', trading_account_id: 'ta-001', period_start: '2025-02-01', period_end: '2025-02-28', gross_profit: 1450.00, commission_rate: 20, commission_amount: 290.00, status: 'pending' },
    { id: 'com-003', user_id: 'user-001', trading_account_id: 'ta-002', period_start: '2025-01-01', period_end: '2025-01-31', gross_profit: 420.75, commission_rate: 20, commission_amount: 84.15, status: 'pending' },
    { id: 'com-004', user_id: 'user-001', trading_account_id: 'ta-002', period_start: '2025-02-01', period_end: '2025-02-28', gross_profit: 850.00, commission_rate: 20, commission_amount: 170.00, status: 'pending' },
    { id: 'com-005', user_id: 'user-1786042730290-fao8b', trading_account_id: 'ta-004', period_start: '2025-01-01', period_end: '2025-01-31', gross_profit: 300.25, commission_rate: 20, commission_amount: 60.05, status: 'paid', paid_at: '2025-02-05', payment_method: 'cripto' },
  ];

  for (const c of commissions) {
    await client.query(`
      INSERT INTO commissions (id, user_id, trading_account_id, period_start, period_end, gross_profit, commission_rate, commission_amount, status, paid_at, payment_method, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now(),now())
      ON CONFLICT (id) DO NOTHING
    `, [c.id, c.user_id, c.trading_account_id, c.period_start, c.period_end, c.gross_profit, c.commission_rate, c.commission_amount, c.status, c.paid_at || null, c.payment_method || null]);
    console.log('✅ Commission:', c.commission_amount, c.status);
  }

  // ─── Account Snapshots (for charts) ───────────────────
  const now = Date.now();
  const snapshots = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    // Admin account - growing trend
    snapshots.push({
      trading_account_id: 'ta-001',
      balance: 10000 + (30 - i) * 85 + Math.sin(i) * 200,
      equity: 10000 + (30 - i) * 95 + Math.sin(i) * 250,
      daily_pnl: Math.sin(i) * 150 + 50,
      open_trades: Math.floor(Math.abs(Math.sin(i)) * 5) + 1,
      captured_at: date.toISOString()
    });
    // Demo account
    snapshots.push({
      trading_account_id: 'ta-002',
      balance: 8000 + (30 - i) * 18 + Math.cos(i) * 100,
      equity: 8000 + (30 - i) * 25 + Math.cos(i) * 120,
      daily_pnl: Math.cos(i) * 80 + 20,
      open_trades: Math.floor(Math.abs(Math.cos(i)) * 3) + 1,
      captured_at: date.toISOString()
    });
  }

  for (const s of snapshots) {
    await client.query(`
      INSERT INTO account_snapshots (id, trading_account_id, balance, equity, daily_pnl, open_trades, captured_at)
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6)
    `, [s.trading_account_id, s.balance.toFixed(2), s.equity.toFixed(2), s.daily_pnl.toFixed(2), s.open_trades, s.captured_at]);
  }
  console.log(`✅ Account snapshots: ${snapshots.length} created`);

  console.log('🎉 Business seed completed!');
  await client.end();
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
