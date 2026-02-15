-- Add admission_fee and uniform_fee columns to fees table
ALTER TABLE fees
ADD COLUMN IF NOT EXISTS admission_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS uniform_fee DECIMAL(10, 2) DEFAULT 0;

-- Update existing rows to have default values if NULL
UPDATE fees SET admission_fee = 0 WHERE admission_fee IS NULL;
UPDATE fees SET uniform_fee = 0 WHERE uniform_fee IS NULL;

-- Set NOT NULL constraints
ALTER TABLE fees
ALTER COLUMN admission_fee SET NOT NULL,
ALTER COLUMN uniform_fee SET NOT NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'fees'
ORDER BY ordinal_position;
