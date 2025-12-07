-- Migration: Add child_blood_group and parent_address columns to admission table
-- Date: December 7, 2025
-- Description: Add optional blood group field for child and compulsory address field for parent

-- Add child_blood_group column (OPTIONAL - can be null)
ALTER TABLE admission
ADD COLUMN IF NOT EXISTS child_blood_group VARCHAR(5) NULL;

-- Add parent_address column (COMPULSORY - cannot be null for new records, but existing records can have null)
ALTER TABLE admission
ADD COLUMN IF NOT EXISTS parent_address TEXT NULL;

-- Add comments to the columns for documentation
COMMENT ON COLUMN admission.child_blood_group IS 'Child blood group (optional): O+, O-, A+, A-, B+, B-, AB+, AB-';
COMMENT ON COLUMN admission.parent_address IS 'Complete address of parent (compulsory): includes street, city, state, postal code';

-- Create an index on parent_address for better search performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_admission_parent_address ON admission (parent_address);

-- Verify the changes
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'admission' 
-- AND column_name IN ('child_blood_group', 'parent_address');
