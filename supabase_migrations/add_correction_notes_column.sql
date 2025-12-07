-- Add correction_notes column to admission table
-- This column stores admin feedback for "Under Correction" status

ALTER TABLE public.admission
ADD COLUMN IF NOT EXISTS correction_notes TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.admission.correction_notes IS 'Admin notes about what needs to be corrected when status is Under Correction';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_admission_correction_notes ON public.admission(correction_notes) WHERE admission_status = 'Under Correction';
