-- Bookmark/favorite ideas: a saved flag independent of the new/used/dismissed lifecycle.
ALTER TABLE engagement_ideas
  ADD COLUMN IF NOT EXISTS saved BOOLEAN NOT NULL DEFAULT false;
