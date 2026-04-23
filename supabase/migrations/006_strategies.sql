CREATE TABLE IF NOT EXISTS strategies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','linkedin','twitter','youtube')),
  account TEXT NOT NULL CHECK (account IN ('personal','business','both')),
  category TEXT NOT NULL CHECK (category IN ('hook','format','engagement','cadence','distribution','positioning')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  when_to_use TEXT NOT NULL,
  how_to_apply TEXT[] DEFAULT '{}',
  example TEXT,
  why_it_works TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategies_platform_account ON strategies(platform, account);
CREATE INDEX IF NOT EXISTS idx_strategies_active ON strategies(is_active);

ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON strategies;
CREATE POLICY "Service role full access" ON strategies FOR ALL USING (true) WITH CHECK (true);
