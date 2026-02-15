-- ============================================================================
-- REGISTRATION FEES IN RECEIPTS - SQL QUERY REFERENCE
-- ============================================================================
-- Complete SQL queries for working with registration fees in receipts
-- Date: February 15, 2026
-- ============================================================================

-- ============================================================================
-- TABLE 1: MIGRATIONS & SETUP
-- ============================================================================

-- Add registration fee columns (Run once)
ALTER TABLE public.fee_receipts 
ADD COLUMN IF NOT EXISTS registration_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS include_registration_fee boolean DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_fee_receipts_include_registration_fee 
ON public.fee_receipts(include_registration_fee);

-- Verify column structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'fee_receipts' 
ORDER BY ordinal_position;

-- ============================================================================
-- TABLE 2: READ QUERIES
-- ============================================================================

-- 2.1: Get all receipts with registration fees
SELECT 
    receipt_number,
    student_name,
    admission_number,
    program,
    month,
    year,
    fees_amount,
    registration_fee,
    (fees_amount + registration_fee) as total_amount,
    payment_date,
    status
FROM public.fee_receipts
WHERE include_registration_fee = true
ORDER BY payment_date DESC;

-- 2.2: Get recent receipts (last 30 days) with registration
SELECT 
    receipt_number,
    student_name,
    program,
    (fees_amount + registration_fee) as total,
    payment_date
FROM public.fee_receipts
WHERE include_registration_fee = true
    AND payment_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY payment_date DESC;

-- 2.3: Get receipts for a specific student
SELECT 
    receipt_number,
    program,
    month,
    year,
    fees_amount,
    registration_fee,
    include_registration_fee,
    (CASE WHEN include_registration_fee THEN fees_amount + registration_fee ELSE fees_amount END) as total,
    status
FROM public.fee_receipts
WHERE student_name = 'John Doe'
ORDER BY payment_date DESC;

-- 2.4: Get receipts for a specific program
SELECT 
    receipt_number,
    student_name,
    month,
    year,
    fees_amount,
    registration_fee,
    (fees_amount + CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total
FROM public.fee_receipts
WHERE program = 'Play Group'
    AND include_registration_fee = true
ORDER BY payment_date DESC;

-- 2.5: Find unpaid receipts with registration fees
SELECT 
    receipt_number,
    student_name,
    program,
    fees_amount,
    registration_fee,
    (fees_amount + registration_fee) as total_due,
    payment_date,
    status
FROM public.fee_receipts
WHERE include_registration_fee = true
    AND status IN ('pending', 'partial')
ORDER BY payment_date ASC;

-- ============================================================================
-- TABLE 3: AGGREGATION & REPORTING QUERIES
-- ============================================================================

-- 3.1: Total revenue with registration fees breakdown
SELECT 
    COUNT(*) as total_receipts,
    SUM(fees_amount) as total_monthly_annual,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total_registration,
    SUM(fees_amount) + SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total_revenue
FROM public.fee_receipts
WHERE status = 'paid';

-- 3.2: Current month revenue
SELECT 
    COUNT(*) as receipt_count,
    SUM(fees_amount) as monthly_fees,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as registration_fees,
    SUM(fees_amount) + SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total
FROM public.fee_receipts
WHERE status = 'paid'
    AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE);

-- 3.3: Revenue by program
SELECT 
    program,
    COUNT(*) as receipt_count,
    SUM(fees_amount) as monthly_annual_total,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as registration_total,
    SUM(fees_amount) + SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as program_total
FROM public.fee_receipts
WHERE status = 'paid'
GROUP BY program
ORDER BY program_total DESC;

-- 3.4: Program-wise registration fee collection
SELECT 
    program,
    COUNT(CASE WHEN include_registration_fee THEN 1 END) as registrations_collected,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as registration_amount,
    COUNT(*) as total_receipts
FROM public.fee_receipts
WHERE status = 'paid'
GROUP BY program
ORDER BY registration_amount DESC;

-- 3.5: Monthly revenue trend (last 6 months)
SELECT 
    DATE_TRUNC('month', payment_date)::date as month,
    COUNT(*) as receipt_count,
    SUM(fees_amount) as monthly_fees,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as registration_fees,
    SUM(fees_amount) + SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total
FROM public.fee_receipts
WHERE status = 'paid'
    AND payment_date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY month DESC;

-- 3.6: Payment status breakdown with registration
SELECT 
    status,
    COUNT(*) as receipt_count,
    SUM(fees_amount) as monthly_fees,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as registration_fees,
    SUM(fees_amount) + SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total_amount
FROM public.fee_receipts
GROUP BY status
ORDER BY receipt_count DESC;

-- 3.7: Average fees per student by program
SELECT 
    program,
    COUNT(DISTINCT student_name) as unique_students,
    ROUND(AVG(fees_amount), 2) as avg_monthly_fee,
    ROUND(SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) / COUNT(DISTINCT student_name), 2) as avg_registration_per_student,
    COUNT(CASE WHEN include_registration_fee THEN 1 END) as students_with_registration
FROM public.fee_receipts
WHERE status = 'paid'
GROUP BY program
ORDER BY program;

-- ============================================================================
-- TABLE 4: STUDENTS & ENROLLMENT ANALYSIS
-- ============================================================================

-- 4.1: Students who paid registration fee
SELECT DISTINCT
    a.student_name,
    a.admission_number,
    a.program_name,
    r.receipt_number,
    r.registration_fee,
    r.payment_date
FROM public.admission a
INNER JOIN public.fee_receipts r ON a.admission_number = r.admission_number
WHERE r.include_registration_fee = true
    AND r.status = 'paid'
ORDER BY r.payment_date DESC;

-- 4.2: Students who have NOT paid registration fee
SELECT DISTINCT
    a.student_name,
    a.admission_number,
    a.program_name,
    a.created_at as enrolled_date
FROM public.admission a
WHERE a.admission_number NOT IN (
    SELECT admission_number 
    FROM public.fee_receipts 
    WHERE include_registration_fee = true
        AND status = 'paid'
)
ORDER BY a.created_at DESC;

-- 4.3: Registration fee payment by student
SELECT 
    student_name,
    admission_number,
    program,
    COUNT(CASE WHEN include_registration_fee THEN 1 END) as registration_payments,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as total_registration_paid,
    COUNT(*) as total_receipts,
    SUM(fees_amount) as total_fees_paid
FROM public.fee_receipts
WHERE status = 'paid'
GROUP BY student_name, admission_number, program
ORDER BY admission_number;

-- 4.4: Enrollment rate with registration collection
SELECT 
    a.program_name,
    COUNT(DISTINCT a.admission_number) as total_enrolled,
    COUNT(DISTINCT CASE WHEN r.include_registration_fee THEN r.admission_number END) as registered_paid,
    ROUND(
        COUNT(DISTINCT CASE WHEN r.include_registration_fee THEN r.admission_number END)::numeric / 
        COUNT(DISTINCT a.admission_number) * 100, 2
    ) as registration_collection_rate
FROM public.admission a
LEFT JOIN public.fee_receipts r ON a.admission_number = r.admission_number AND r.status = 'paid'
GROUP BY a.program_name
ORDER BY registration_collection_rate DESC;

-- ============================================================================
-- TABLE 5: INSERT EXAMPLES
-- ============================================================================

-- 5.1: Insert receipt WITH registration fee
INSERT INTO public.fee_receipts (
    student_name,
    admission_number,
    parent_name,
    parent_phone,
    program,
    month,
    year,
    fees_amount,
    registration_fee,
    include_registration_fee,
    payment_mode,
    payment_date,
    receipt_number,
    status,
    notes,
    created_at,
    updated_at
) VALUES (
    'John Doe',
    'ADM-2024-001',
    'Jane Doe',
    '+91 9876543210',
    'Play Group',
    'January',
    2026,
    6000.00,
    2000.00,
    true,
    'cash',
    '2026-02-15',
    'RCP-1707988800000',
    'paid',
    'First receipt with registration fee',
    NOW(),
    NOW()
);

-- 5.2: Insert receipt WITHOUT registration fee
INSERT INTO public.fee_receipts (
    student_name,
    admission_number,
    parent_name,
    parent_phone,
    program,
    month,
    year,
    fees_amount,
    registration_fee,
    include_registration_fee,
    payment_mode,
    payment_date,
    receipt_number,
    status,
    created_at,
    updated_at
) VALUES (
    'Jane Smith',
    'ADM-2024-002',
    'John Smith',
    '+91 9876543211',
    'Nursery',
    'February',
    2026,
    7000.00,
    0,
    false,
    'online',
    '2026-02-20',
    'RCP-1707988800001',
    'paid',
    NOW(),
    NOW()
);

-- 5.3: Bulk insert for multiple students
INSERT INTO public.fee_receipts (
    student_name, admission_number, parent_name, parent_phone,
    program, month, year, fees_amount, registration_fee, include_registration_fee,
    payment_mode, payment_date, receipt_number, status, created_at, updated_at
)
SELECT 
    a.student_name,
    a.admission_number,
    a.father_name,
    a.parent_mobile_number,
    a.program_name,
    'January',
    2026,
    f.monthly_fee,
    f.registration_fee,
    true,
    'cash',
    '2026-02-15',
    'RCP-' || EXTRACT(EPOCH FROM NOW())::text,
    'paid',
    NOW(),
    NOW()
FROM public.admission a
JOIN public.fees f ON a.program_name = f.program_name
WHERE a.status = 'active'
    AND NOT EXISTS (
        SELECT 1 FROM public.fee_receipts 
        WHERE admission_number = a.admission_number 
        AND month = 'January' AND year = 2026
    );

-- ============================================================================
-- TABLE 6: UPDATE QUERIES
-- ============================================================================

-- 6.1: Update receipt status and confirm payment
UPDATE public.fee_receipts
SET 
    status = 'paid',
    include_registration_fee = true,
    registration_fee = 2000.00,
    updated_at = NOW()
WHERE receipt_number = 'RCP-1707988800000';

-- 6.2: Mark registration as collected for a student
UPDATE public.fee_receipts
SET include_registration_fee = true
WHERE admission_number = 'ADM-2024-001'
    AND include_registration_fee = false
    AND status = 'paid'
    AND ROWNUM <= 1;

-- 6.3: Update registration fee amount if program fees change
UPDATE public.fee_receipts fr
SET registration_fee = f.registration_fee,
    updated_at = NOW()
FROM public.fees f
WHERE fr.program = f.program_name
    AND fr.registration_fee != f.registration_fee
    AND fr.include_registration_fee = true;

-- ============================================================================
-- TABLE 7: DELETE QUERIES (Use with caution!)
-- ============================================================================

-- 7.1: Delete duplicate registration fees (keep first)
DELETE FROM public.fee_receipts
WHERE id NOT IN (
    SELECT MIN(id)
    FROM public.fee_receipts
    WHERE include_registration_fee = true
    GROUP BY admission_number
);

-- 7.2: Delete test receipts
DELETE FROM public.fee_receipts
WHERE receipt_number LIKE 'TEST-%'
    OR notes LIKE '%test%';

-- ============================================================================
-- TABLE 8: SUMMARY STATISTICS
-- ============================================================================

-- 8.1: Complete overview
SELECT 
    'Total Receipts' as metric,
    COUNT(*) as value,
    NULL::text as percentage
FROM public.fee_receipts
UNION ALL
SELECT 
    'With Registration Fee',
    COUNT(CASE WHEN include_registration_fee THEN 1 END),
    ROUND(COUNT(CASE WHEN include_registration_fee THEN 1 END)::numeric / COUNT(*) * 100, 2)::text || '%'
FROM public.fee_receipts
UNION ALL
SELECT 
    'Paid Receipts',
    COUNT(CASE WHEN status = 'paid' THEN 1 END),
    ROUND(COUNT(CASE WHEN status = 'paid' THEN 1 END)::numeric / COUNT(*) * 100, 2)::text || '%'
FROM public.fee_receipts
UNION ALL
SELECT 
    'Total Revenue (₹)',
    ROUND(SUM(fees_amount) + SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END), 2)::text,
    NULL
FROM public.fee_receipts
WHERE status = 'paid';

-- 8.2: Program summary
SELECT 
    program,
    COUNT(*) as total_receipts,
    COUNT(CASE WHEN include_registration_fee THEN 1 END) as with_registration,
    SUM(fees_amount) as fees_total,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as registration_total,
    ROUND(
        COUNT(CASE WHEN include_registration_fee THEN 1 END)::numeric / COUNT(*) * 100, 1
    ) as registration_percentage
FROM public.fee_receipts
WHERE status = 'paid'
GROUP BY program
ORDER BY registration_total DESC;

-- ============================================================================
-- TABLE 9: PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Check if indexes exist
SELECT * FROM pg_indexes 
WHERE tablename = 'fee_receipts'
AND indexname LIKE '%registration%';

-- Analyze table for query optimization
ANALYZE public.fee_receipts;

-- Check table size
SELECT 
    pg_size_pretty(pg_total_relation_size('public.fee_receipts')) as table_size;

-- ============================================================================
-- NOTES & USAGE TIPS
-- ============================================================================
/*

1. BASIC WORKFLOW:
   - Run migration to add columns
   - Use INSERT queries to create receipts
   - Use SELECT queries for reporting
   - Use UPDATE queries to modify status

2. KEY COLUMNS:
   - fees_amount: Monthly/Annual fees
   - registration_fee: Registration amount
   - include_registration_fee: Boolean flag

3. CALCULATION:
   Total = fees_amount + (IF include_registration_fee THEN registration_fee ELSE 0)

4. COMMON QUERIES:
   - Get receipts with registration: WHERE include_registration_fee = true
   - Get revenue by program: GROUP BY program
   - Get payment trends: GROUP BY DATE_TRUNC('month', payment_date)

5. PERFORMANCE:
   - Index created on include_registration_fee
   - Use ANALYZE after bulk inserts
   - Join fees table for program data

6. DATA CONSISTENCY:
   - registration_fee defaults to 0
   - include_registration_fee defaults to false
   - Both backward compatible

*/

-- ============================================================================
-- END OF REFERENCE
-- ============================================================================
