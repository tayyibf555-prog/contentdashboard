-- Free-text notes the user can attach to a saved YouTube video idea.
ALTER TABLE video_ideas
  ADD COLUMN IF NOT EXISTS notes TEXT;
