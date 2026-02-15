-- Update fees table to add admission_fee and uniform_fee columns
-- ⚠️ IMPORTANT: Run setup_complete_receipts_system.sql FIRST if tables don't exist!
-- This script is for UPDATING existing tables only

-- Step 1: Add new columns to fees table if they don't exist
ALTER TABLE fees
ADD COLUMN IF NOT EXISTS admission_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS uniform_fee DECIMAL(10, 2) DEFAULT 0;

-- Step 2: Add new columns to receipts table if they don't exist
ALTER TABLE receipts
ADD COLUMN IF NOT EXISTS admission_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS include_admission_fee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS uniform_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS include_uniform_fee BOOLEAN DEFAULT FALSE;

-- Step 3: Verify the changes
-- Check fees table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'fees'
ORDER BY ordinal_position;

-- Step 4: Verify receipts table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'receipts'
ORDER BY ordinal_position;

-- Note: If you want to set default values for existing records, use:
-- UPDATE fees SET admission_fee = 0 WHERE admission_fee IS NULL;
-- UPDATE fees SET uniform_fee = 0 WHERE uniform_fee IS NULL;
-- UPDATE receipts SET admission_fee = 0 WHERE admission_fee IS NULL;
-- UPDATE receipts SET uniform_fee = 0 WHERE uniform_fee IS NULL;

/* 
TROUBLESHOOTING:
If you get "relation receipts does not exist" error:
1. Run: db/setup_complete_receipts_system.sql FIRST
2. Then run this script for any additional updates
*/
