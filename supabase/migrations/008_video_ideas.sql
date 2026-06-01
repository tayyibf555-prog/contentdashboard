-- YouTube video ideas derived from top-performing tracked-channel long-form videos.
-- Mirrors engagement_ideas (Instagram) but tailored to video: recreate-able title,
-- overview of the source video, and how to recreate it.
CREATE TABLE IF NOT EXISTS video_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account TEXT NOT NULL CHECK (account IN ('business', 'personal')),
  source_post_ids UUID[] DEFAULT '{}',
  video_title TEXT NOT NULL,
  overview TEXT NOT NULL,
  how_to_recreate TEXT NOT NULL,
  niche TEXT,
  source_url TEXT,
  source_metric TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'used', 'dismissed')),
  saved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_ideas_account ON video_ideas(account);
CREATE INDEX IF NOT EXISTS idx_video_ideas_status ON video_ideas(status);

ALTER TABLE video_ideas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON video_ideas;
CREATE POLICY "Service role full access" ON video_ideas FOR ALL USING (true) WITH CHECK (true);
