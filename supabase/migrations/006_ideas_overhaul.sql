-- Overhaul engagement_ideas: from "engagement mechanics" to best-performing reel ideas.
-- New shape: a distilled idea from a top competitor reel + link + 2-3 casual framings.

-- Old engagement-mechanic ideas are obsolete under the new format — clear them.
DELETE FROM engagement_ideas;

ALTER TABLE engagement_ideas
  DROP COLUMN IF EXISTS hook_template,
  DROP COLUMN IF EXISTS engagement_mechanic,
  DROP COLUMN IF EXISTS format,
  DROP COLUMN IF EXISTS rationale,
  ADD COLUMN IF NOT EXISTS idea TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS framings TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS source_metric TEXT;
