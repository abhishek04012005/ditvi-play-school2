-- SQL: create downloads table for storing uploaded document metadata
-- Run this in your Supabase SQL editor or psql

CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  details text,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  url text,
  drive_file_id text,
  created_by text,
  CONSTRAINT downloads_uploaded_at_check CHECK (uploaded_at IS NOT NULL)
);

-- Optional: create an index for faster ordering by uploaded_at
CREATE INDEX IF NOT EXISTS idx_downloads_uploaded_at ON public.downloads (uploaded_at DESC);

-- Grant select/insert/delete to anon or authenticated role as appropriate in Supabase
-- Example (adjust roles as needed):
-- GRANT SELECT ON public.downloads TO anon;
-- GRANT INSERT, DELETE ON public.downloads TO authenticated;
