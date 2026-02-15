-- ============================================================================
-- FEES MANAGEMENT SYSTEM - COMPLETE SQL SETUP
-- Execute all scripts in Supabase SQL Editor in the order provided
-- ============================================================================

-- ============================================================================
-- SCRIPT 1: Create fees table (EXECUTE FIRST)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    annual_fee DECIMAL(10, 2) NOT NULL,
    registration_fee DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fees_program_name ON fees(program_name);

-- ============================================================================
-- SCRIPT 2: Insert default fee structure
-- ============================================================================

INSERT INTO fees (program_name, description, monthly_fee, annual_fee, registration_fee) VALUES
    ('Play Group', 'Age: 1.5 - 2.5 years', 6000, 72000, 2000),
    ('Nursery', 'Age: 2.5 - 3.5 years', 7000, 84000, 2500),
    ('Junior KG', 'Age: 3.5 - 4.5 years', 8000, 96000, 3000),
    ('Senior KG', 'Age: 4.5 - 5.5 years', 9000, 108000, 3500)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCRIPT 3: Link fee_receipts table with fees table (ENSURE fee_receipts EXISTS FIRST)
-- ============================================================================

-- Add fee_id column to link receipts with fees
ALTER TABLE fee_receipts 
ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL;

-- Add index on fee_id for faster queries
CREATE INDEX IF NOT EXISTS idx_fee_receipts_fee_id ON fee_receipts(fee_id);

-- ============================================================================
-- SCRIPT 4: Create trigger for auto-update timestamp
-- ============================================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_fees_timestamp ON fees;
CREATE TRIGGER update_fees_timestamp
BEFORE UPDATE ON fees
FOR EACH ROW
EXECUTE FUNCTION update_fees_updated_at();

-- ============================================================================
-- OPTIONAL: Enable Row Level Security (RLS) for fees table
-- ============================================================================

-- Enable RLS
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read active fees
CREATE POLICY "Allow anyone to read active fees" ON fees
    FOR SELECT
    USING (is_active = true);

-- Create policy for authenticated admin users to manage fees
-- Assuming you have an admin role in your auth setup
CREATE POLICY "Allow authenticated users to manage fees" ON fees
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- OPTIONAL: Create view for active fees with receipt count
-- ============================================================================

CREATE OR REPLACE VIEW fees_with_receipt_count AS
SELECT 
    f.id,
    f.program_name,
    f.description,
    f.monthly_fee,
    f.annual_fee,
    f.registration_fee,
    f.is_active,
    f.created_at,
    f.updated_at,
    COUNT(r.id)::INTEGER as receipt_count
FROM fees f
LEFT JOIN fee_receipts r ON f.id = r.fee_id AND r.status = 'paid'
GROUP BY f.id, f.program_name, f.description, f.monthly_fee, f.annual_fee, 
         f.registration_fee, f.is_active, f.created_at, f.updated_at
ORDER BY f.created_at DESC;

-- ============================================================================
-- OPTIONAL: Backup/Verify Data
-- ============================================================================

-- Check if fees table was created correctly
-- SELECT * FROM fees;

-- Check if fee_receipts table has fee_id column
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'fee_receipts' AND column_name = 'fee_id';

-- Count receipts by program
-- SELECT 
--     f.program_name,
--     COUNT(r.id) as total_receipts,
--     SUM(r.fees_amount) as total_collected
-- FROM fees f
-- LEFT JOIN fee_receipts r ON f.program_name = r.program
-- WHERE r.status = 'paid'
-- GROUP BY f.program_name;

-- ============================================================================
-- OPTIONAL: Maintenance Queries
-- ============================================================================

-- Disable a fee instead of deleting
-- UPDATE fees SET is_active = false WHERE program_name = 'Program Name';

-- Reactivate a fee
-- UPDATE fees SET is_active = true WHERE program_name = 'Program Name';

-- Update all fees by percentage (e.g., 10% increase)
-- UPDATE fees 
-- SET monthly_fee = monthly_fee * 1.10,
--     annual_fee = annual_fee * 1.10,
--     registration_fee = registration_fee * 1.10
-- WHERE is_active = true;

-- ============================================================================
-- END OF SQL SETUP
-- ============================================================================

-- IMPORTANT NOTES:
-- 1. Execute scripts in order (SCRIPT 1 → SCRIPT 2 → SCRIPT 3 → SCRIPT 4)
-- 2. Ensure fee_receipts table exists before running SCRIPT 3
-- 3. Optional RLS policies can be customized based on your auth setup
-- 4. The view and maintenance queries are optional for monitoring
-- 5. Always backup your database before running these scripts
-- 6. Test in development environment first
