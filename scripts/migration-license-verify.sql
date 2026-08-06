-- ============================================================
-- Trading Pro — License Verification Schema Migration
-- Adds bot-oriented fields to licenses + creates license_checks
-- ============================================================

-- 1. Add new columns to existing licenses table
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS "clientName" TEXT,
  ADD COLUMN IF NOT EXISTS "clientEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "machineId" TEXT,
  ADD COLUMN IF NOT EXISTS "accountNumber" INTEGER,
  ADD COLUMN IF NOT EXISTS "minBalanceUsd" NUMERIC DEFAULT 600,
  ADD COLUMN IF NOT EXISTS "profitSharePercent" NUMERIC DEFAULT 20,
  ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "lastPaymentAmount" NUMERIC,
  ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- 2. Expand status CHECK constraint (drop old, add new)
-- First drop if exists, then add the expanded one
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_status_check;
ALTER TABLE licenses ADD CONSTRAINT licenses_status_check
  CHECK (status IN ('available', 'assigned', 'active', 'payment_due', 'balance_low', 'expired', 'paused', 'revoked'));

-- 3. Create license_checks audit table
CREATE TABLE IF NOT EXISTS license_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL,
  machine_id TEXT,
  account_number INTEGER,
  bot_version TEXT,
  status_returned TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses (key);
CREATE INDEX IF NOT EXISTS idx_license_checks_key ON license_checks (license_key);
CREATE INDEX IF NOT EXISTS idx_license_checks_created ON license_checks (created_at);

-- 5. Enable RLS (Row Level Security) on license_checks
ALTER TABLE license_checks ENABLE ROW LEVEL SECURITY;

-- 6. RLS policy: allow service_role full access, anon only insert (for bot check-ins)
CREATE POLICY "Service role can do everything on license_checks"
  ON license_checks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can insert license_checks"
  ON license_checks FOR INSERT
  TO anon
  WITH CHECK (true);
