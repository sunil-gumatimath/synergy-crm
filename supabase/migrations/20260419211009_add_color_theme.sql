-- Add color_theme column to user_settings table
-- This stores the user's preferred color theme (default, midnight, sunset, forest, nord, rose)

ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'default';

-- Add a CHECK constraint to validate theme values
ALTER TABLE public.user_settings
ADD CONSTRAINT valid_color_theme CHECK (
  color_theme IN ('default', 'midnight', 'sunset', 'forest', 'nord', 'rose')
);
