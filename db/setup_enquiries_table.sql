-- Create enquiries table (matches admission table structure pattern)
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  parent_name text NOT NULL,
  child_name text NOT NULL,
  phone text NOT NULL,
  program text NOT NULL,
  created_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  status text NULL DEFAULT 'new'::text,
  notes_updated_at timestamp without time zone NULL DEFAULT now(),
  notes jsonb NULL,
  enquiry_number character varying(20) NULL,
  CONSTRAINT enquiries_pkey PRIMARY KEY (id),
  CONSTRAINT enquiries_enquiry_number_key UNIQUE (enquiry_number)
) TABLESPACE pg_default;

-- Create indexes for performance (similar to admission table)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enquiries_enquiry_number ON public.enquiries USING btree (enquiry_number) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries USING btree (status) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.enquiries USING btree (phone) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries USING btree (created_at DESC) TABLESPACE pg_default;

-- Enable RLS on enquiries table
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert on enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow public read on enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow authenticated users to manage enquiries" ON public.enquiries;

-- Create policy to allow anonymous users to insert enquiries
CREATE POLICY "Allow public insert on enquiries"
  ON public.enquiries
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anonymous users to read enquiries
CREATE POLICY "Allow public read on enquiries"
  ON public.enquiries
  FOR SELECT
  USING (true);

-- Create policy for authenticated users (admin) to update/delete
CREATE POLICY "Allow authenticated users to manage enquiries"
  ON public.enquiries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
