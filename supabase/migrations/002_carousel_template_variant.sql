-- Add template variant and accent color to carousel slides
ALTER TABLE carousel_slides ADD COLUMN template_variant TEXT DEFAULT 'architect';
ALTER TABLE carousel_slides ADD COLUMN accent_color TEXT DEFAULT '#00d4aa';
