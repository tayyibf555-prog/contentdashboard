-- Add 'reel' to the content_type CHECK constraint on generated_content
ALTER TABLE generated_content DROP CONSTRAINT generated_content_content_type_check;
ALTER TABLE generated_content ADD CONSTRAINT generated_content_content_type_check
  CHECK (content_type IN ('carousel', 'long_form', 'short', 'video_script', 'thread', 'tweet', 'reel'));

-- Reel scripts table (same pattern as youtube_scripts)
CREATE TABLE reel_scripts (
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

-- Enable RLS
ALTER TABLE reel_scripts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access" ON reel_scripts
  FOR ALL USING (true) WITH CHECK (true);
