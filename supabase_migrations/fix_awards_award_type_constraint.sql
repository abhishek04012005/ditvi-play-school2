-- Fix awards table to allow any award_type value (not just hardcoded enums)
-- This migration removes the restrictive CHECK constraint and allows custom types

-- Step 1: Drop the existing CHECK constraint if it exists
ALTER TABLE IF EXISTS public.awards 
DROP CONSTRAINT IF EXISTS awards_award_type_check;

-- Step 2: Ensure award_type column can accept any text value
-- If the column needs to be TEXT type, update it
ALTER TABLE public.awards 
ALTER COLUMN award_type SET DATA TYPE TEXT;

-- Step 3: Add a more permissive constraint (optional - allows non-empty strings)
ALTER TABLE public.awards
ADD CONSTRAINT awards_award_type_not_empty CHECK (award_type != '');

-- Note: If you want to add a foreign key constraint to spotlight_types table later,
-- you can use this query:
-- ALTER TABLE public.awards
-- ADD CONSTRAINT awards_award_type_fk 
-- FOREIGN KEY (award_type) REFERENCES public.spotlight_types(id)
-- ON DELETE RESTRICT ON UPDATE CASCADE;
