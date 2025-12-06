-- Create spotlight_types table for custom award types
CREATE TABLE IF NOT EXISTS public.spotlight_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#6a4c93',
    description TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.spotlight_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read
CREATE POLICY "Enable read access for all authenticated users" 
    ON public.spotlight_types 
    FOR SELECT 
    USING (true);

-- Create policy to allow all authenticated users to insert
CREATE POLICY "Enable insert access for all authenticated users" 
    ON public.spotlight_types 
    FOR INSERT 
    WITH CHECK (true);

-- Create policy to allow all authenticated users to delete
CREATE POLICY "Enable delete access for all authenticated users" 
    ON public.spotlight_types 
    FOR DELETE 
    USING (true);

-- Create policy to allow all authenticated users to update
CREATE POLICY "Enable update access for all authenticated users" 
    ON public.spotlight_types 
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Add index on created_date for better query performance
CREATE INDEX IF NOT EXISTS spotlight_types_created_date_idx 
    ON public.spotlight_types (created_date);
