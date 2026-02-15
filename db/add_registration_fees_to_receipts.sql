-- ============================================================================
-- Add Registration Fees Support to Fee Receipts Table
-- ============================================================================
-- This migration adds support for including registration fees in receipts
-- along with monthly/annual fees.
--
-- Changes:
-- 1. Add 'registration_fee' column to track registration fee amount
-- 2. Add 'include_registration_fee' boolean to track if registration fee was included
-- 3. Update existing receipts to have default values
-- 4. Add indexes for better query performance
--
-- Date: February 15, 2026
-- ============================================================================

-- Step 1: Add new columns to fee_receipts table
ALTER TABLE public.fee_receipts 
ADD COLUMN IF NOT EXISTS registration_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS include_registration_fee boolean DEFAULT false;

-- Step 2: Set indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_receipts_include_registration_fee 
ON public.fee_receipts(include_registration_fee);

-- Step 3: Add comment to columns for documentation
COMMENT ON COLUMN public.fee_receipts.registration_fee IS 'Registration fee amount charged in this receipt';
COMMENT ON COLUMN public.fee_receipts.include_registration_fee IS 'Boolean flag to indicate if registration fee was included with monthly/annual fee';

-- Step 4: Verify the table structure
-- Run this query to verify the changes:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'fee_receipts' 
-- ORDER BY ordinal_position;

-- Step 5: Example queries for using registration fees

-- Example 1: Create a receipt with registration fee
-- INSERT INTO public.fee_receipts (
--     student_name,
--     admission_number,
--     parent_name,
--     parent_phone,
--     program,
--     month,
--     year,
--     fees_amount,
--     registration_fee,
--     include_registration_fee,
--     payment_mode,
--     payment_date,
--     receipt_number,
--     status,
--     notes,
--     created_at,
--     updated_at
-- ) VALUES (
--     'John Doe',
--     'ADM-2024-001',
--     'Jane Doe',
--     '+91 9876543210',
--     'Play Group',
--     'January',
--     2026,
--     6000.00,
--     2000.00,
--     true,
--     'cash',
--     '2026-02-15',
--     'RCP-1707988800000',
--     'paid',
--     'First receipt with registration fee',
--     NOW(),
--     NOW()
-- );

-- Example 2: Calculate total amount including registration fees
-- SELECT 
--     receipt_number,
--     student_name,
--     program,
--     fees_amount,
--     registration_fee,
--     include_registration_fee,
--     (fees_amount + CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total_amount
-- FROM public.fee_receipts
-- WHERE include_registration_fee = true
-- ORDER BY created_at DESC;

-- Example 3: Get all receipts with registration fees
-- SELECT 
--     id,
--     receipt_number,
--     student_name,
--     program,
--     month,
--     year,
--     fees_amount,
--     registration_fee,
--     payment_date,
--     status
-- FROM public.fee_receipts
-- WHERE include_registration_fee = true
-- ORDER BY created_at DESC;

-- Example 4: Calculate total revenue including registration fees
-- SELECT 
--     SUM(fees_amount) as total_fees,
--     SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total_registration,
--     SUM(fees_amount) + SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total_revenue
-- FROM public.fee_receipts
-- WHERE status = 'paid';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- If you need to revert these changes:
--
-- ALTER TABLE public.fee_receipts
-- DROP COLUMN IF EXISTS registration_fee,
-- DROP COLUMN IF EXISTS include_registration_fee;
--
-- DROP INDEX IF EXISTS idx_fee_receipts_include_registration_fee;

-- ============================================================================
-- Migration complete!
-- ============================================================================
-- The fee_receipts table now supports registration fees.
-- 
-- Updated fields in ReceiptData interface:
-- - registration_fee?: number (optional, amount of registration fee)
-- - include_registration_fee?: boolean (optional, whether registration fee was included)
--
-- New functionality:
-- - Checkbox in receipt form to include registration fee
-- - Registration fee amount auto-populated from fees table
-- - Receipt total includes both monthly/annual fees AND registration fee
-- - Receipt template displays both fee types with breakdown
-- ============================================================================
