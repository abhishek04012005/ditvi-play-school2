-- Add remark column to admission table
-- This column stores admin remarks about what needs to be corrected

ALTER TABLE public.admission
ADD COLUMN IF NOT EXISTS remark TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN public.admission.remark IS 'Admin remarks about what needs to be corrected when status is Under Correction. Visible to users.';

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_admission_remark ON public.admission(remark) WHERE admission_status = 'Under Correction';
