-- ============================================================================
-- Content Dashboard: full setup for a fresh Supabase project.
-- Run this ONCE in the SQL Editor of a new project. Idempotent where possible.
-- Combines migrations 001-004 and adds RLS policies for service-role access.
-- ============================================================================

-- ─── Tables ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tracked_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('leader', 'competitor', 'other')),
  platforms JSONB NOT NULL DEFAULT '[]',
  handles JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scraped_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracked_account_id UUID REFERENCES tracked_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT,
  content_summary TEXT,
  engagement_stats JSONB DEFAULT '{}',
  url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scraped_post_id UUID REFERENCES scraped_posts(id) ON DELETE CASCADE,
  key_insight TEXT,
  content_opportunity TEXT,
  suggested_pillar TEXT,
  trending_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  account TEXT NOT NULL CHECK (account IN ('business', 'personal')),
  content_type TEXT NOT NULL CHECK (content_type IN ('carousel', 'long_form', 'short', 'video_script', 'thread', 'tweet', 'reel')),
  title TEXT NOT NULL,
  body TEXT,
  hashtags TEXT[] DEFAULT '{}',
  pillar TEXT,
  source_type TEXT,
  source_reference TEXT,
  best_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'posted', 'draft')),
  is_repurposed BOOLEAN DEFAULT FALSE,
  repurposed_from UUID REFERENCES generated_content(id),
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carousel_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  headline TEXT,
  body_text TEXT,
  slide_type TEXT NOT NULL CHECK (slide_type IN ('cover', 'content', 'cta')),
  image_url TEXT,
  custom_background_url TEXT,
  template_variant TEXT DEFAULT 'architect',
  accent_color TEXT DEFAULT '#00d4aa',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS youtube_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  hook TEXT,
  intro TEXT,
  body_sections JSONB DEFAULT '[]',
  cta TEXT,
  thumbnail_concepts JSONB DEFAULT '[]',
  title_variants JSONB DEFAULT '[]',
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  estimated_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reel_scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  hook TEXT,
  body_script TEXT,
  cta TEXT,
  on_screen_text TEXT[] DEFAULT '{}',
  estimated_duration TEXT DEFAULT '30s',
  recording_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS engagement_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('business', 'personal')),
  ayrshare_profile_key TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voice_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_type TEXT NOT NULL CHECK (account_type IN ('business', 'personal')),
  writing_samples TEXT[] DEFAULT '{}',
  tone_guidelines TEXT,
  avoid_words TEXT[] DEFAULT '{}',
  preferred_words TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evergreen_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  last_reshared_at TIMESTAMPTZ,
  reshare_count INTEGER DEFAULT 0,
  cooldown_days INTEGER DEFAULT 30
);

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

-- ─── Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_platform ON generated_content(platform);
CREATE INDEX IF NOT EXISTS idx_generated_content_account ON generated_content(account);
CREATE INDEX IF NOT EXISTS idx_generated_content_scheduled ON generated_content(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scraped_posts_account ON scraped_posts(tracked_account_id);
CREATE INDEX IF NOT EXISTS idx_scraped_posts_scraped_at ON scraped_posts(scraped_at);

-- ─── RLS: enable + service-role bypass on all tables ───────────────────────

ALTER TABLE tracked_accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis           ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content     ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_slides       ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_scripts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reel_scripts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_metrics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_auth_tokens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE evergreen_content     ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_ideas      ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  PERFORM 1;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop-and-create policies so re-running is safe
DROP POLICY IF EXISTS "Service role full access" ON tracked_accounts;
CREATE POLICY "Service role full access" ON tracked_accounts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON scraped_posts;
CREATE POLICY "Service role full access" ON scraped_posts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON ai_analysis;
CREATE POLICY "Service role full access" ON ai_analysis FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON generated_content;
CREATE POLICY "Service role full access" ON generated_content FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON carousel_slides;
CREATE POLICY "Service role full access" ON carousel_slides FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON youtube_scripts;
CREATE POLICY "Service role full access" ON youtube_scripts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON reel_scripts;
CREATE POLICY "Service role full access" ON reel_scripts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON engagement_metrics;
CREATE POLICY "Service role full access" ON engagement_metrics FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON social_auth_tokens;
CREATE POLICY "Service role full access" ON social_auth_tokens FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON voice_settings;
CREATE POLICY "Service role full access" ON voice_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON evergreen_content;
CREATE POLICY "Service role full access" ON evergreen_content FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access" ON engagement_ideas;
CREATE POLICY "Service role full access" ON engagement_ideas FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_engagement_ideas_account ON engagement_ideas(account);
CREATE INDEX IF NOT EXISTS idx_engagement_ideas_status ON engagement_ideas(status);

-- ─── Storage bucket for carousel images ────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read + service-role write on the bucket
DROP POLICY IF EXISTS "Public read carousel images" ON storage.objects;
CREATE POLICY "Public read carousel images" ON storage.objects
  FOR SELECT USING (bucket_id = 'carousel-images');

DROP POLICY IF EXISTS "Service role write carousel images" ON storage.objects;
CREATE POLICY "Service role write carousel images" ON storage.objects
  FOR ALL USING (bucket_id = 'carousel-images') WITH CHECK (bucket_id = 'carousel-images');
