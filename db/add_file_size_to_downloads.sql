-- SQL: Add file_size column to downloads table
-- Run this in your Supabase SQL editor

ALTER TABLE public.downloads
ADD COLUMN IF NOT EXISTS file_size integer;

-- Optional: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_downloads_file_size ON public.downloads (file_size);
