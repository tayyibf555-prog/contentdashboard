-- Tracked accounts (leaders, competitors)
CREATE TABLE tracked_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('leader', 'competitor', 'other')),
  platforms JSONB NOT NULL DEFAULT '[]',
  handles JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraped posts from tracked accounts
CREATE TABLE scraped_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracked_account_id UUID REFERENCES tracked_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  title TEXT,
  content_summary TEXT,
  engagement_stats JSONB DEFAULT '{}',
  url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis of scraped posts
CREATE TABLE ai_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scraped_post_id UUID REFERENCES scraped_posts(id) ON DELETE CASCADE,
  key_insight TEXT,
  content_opportunity TEXT,
  suggested_pillar TEXT,
  trending_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated content for all platforms
CREATE TABLE generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  account TEXT NOT NULL CHECK (account IN ('business', 'personal')),
  content_type TEXT NOT NULL CHECK (content_type IN ('carousel', 'long_form', 'short', 'video_script', 'thread', 'tweet')),
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

-- Carousel slides
CREATE TABLE carousel_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  headline TEXT,
  body_text TEXT,
  slide_type TEXT NOT NULL CHECK (slide_type IN ('cover', 'content', 'cta')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube scripts
CREATE TABLE youtube_scripts (
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

-- Engagement metrics
CREATE TABLE engagement_metrics (
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

-- Social auth tokens (Ayrshare)
CREATE TABLE social_auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('business', 'personal')),
  ayrshare_profile_key TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice settings for tone training
CREATE TABLE voice_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_type TEXT NOT NULL CHECK (account_type IN ('business', 'personal')),
  writing_samples TEXT[] DEFAULT '{}',
  tone_guidelines TEXT,
  avoid_words TEXT[] DEFAULT '{}',
  preferred_words TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evergreen content bank
CREATE TABLE evergreen_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  generated_content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  last_reshared_at TIMESTAMPTZ,
  reshare_count INTEGER DEFAULT 0,
  cooldown_days INTEGER DEFAULT 30
);

-- Indexes for common queries
CREATE INDEX idx_generated_content_status ON generated_content(status);
CREATE INDEX idx_generated_content_platform ON generated_content(platform);
CREATE INDEX idx_generated_content_account ON generated_content(account);
CREATE INDEX idx_generated_content_scheduled ON generated_content(scheduled_for);
CREATE INDEX idx_scraped_posts_account ON scraped_posts(tracked_account_id);
CREATE INDEX idx_scraped_posts_scraped_at ON scraped_posts(scraped_at);
