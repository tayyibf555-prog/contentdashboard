-- Add 'story' to the content_type CHECK constraint on generated_content
ALTER TABLE generated_content DROP CONSTRAINT generated_content_content_type_check;
ALTER TABLE generated_content ADD CONSTRAINT generated_content_content_type_check
  CHECK (content_type IN ('carousel', 'long_form', 'short', 'video_script', 'thread', 'tweet', 'reel', 'story'));
