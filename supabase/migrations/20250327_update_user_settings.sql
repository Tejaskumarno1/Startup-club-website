
-- Add social_links column to user_settings table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_settings' 
        AND column_name = 'social_links'
    ) THEN
        ALTER TABLE public.user_settings ADD COLUMN social_links JSONB;
    END IF;
END
$$;
