-- Add custom background image URL to carousel_slides for user-uploaded personal backgrounds
ALTER TABLE carousel_slides
ADD COLUMN IF NOT EXISTS custom_background_url text;
