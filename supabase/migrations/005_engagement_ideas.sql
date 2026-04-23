-- Engagement ideas derived from scraped tracked-account posts
CREATE TABLE IF NOT EXISTS engagement_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account TEXT NOT NULL CHECK (account IN ('business', 'personal')),
  source_post_ids UUID[] DEFAULT '{}',
  topic TEXT NOT NULL,
  hook_template TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('reel', 'carousel', 'post')),
  engagement_mechanic TEXT NOT NULL,
  rationale TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'used', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagement_ideas_account ON engagement_ideas(account);
CREATE INDEX IF NOT EXISTS idx_engagement_ideas_status ON engagement_ideas(status);

ALTER TABLE engagement_ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON engagement_ideas;
CREATE POLICY "Service role full access" ON engagement_ideas FOR ALL USING (true) WITH CHECK (true);
