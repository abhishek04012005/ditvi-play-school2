-- Complete Database Setup for Fees and Receipts
-- Run this in Supabase SQL Editor

-- Step 1: Create fees table if it doesn't exist
CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name VARCHAR(255) NOT NULL,
    description TEXT,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    annual_fee DECIMAL(10, 2) NOT NULL,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    admission_fee DECIMAL(10, 2) DEFAULT 0,
    uniform_fee DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(program_name)
);

-- Step 2: Create receipts table if it doesn't exist
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    student_name VARCHAR(255) NOT NULL,
    admission_number VARCHAR(50),
    parent_name VARCHAR(255),
    parent_phone VARCHAR(20),
    program VARCHAR(255) NOT NULL,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    fees_amount DECIMAL(10, 2) NOT NULL,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    include_registration_fee BOOLEAN DEFAULT FALSE,
    admission_fee DECIMAL(10, 2) DEFAULT 0,
    include_admission_fee BOOLEAN DEFAULT FALSE,
    uniform_fee DECIMAL(10, 2) DEFAULT 0,
    include_uniform_fee BOOLEAN DEFAULT FALSE,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'cash',
    payment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_receipts_student_name ON receipts(student_name);
CREATE INDEX IF NOT EXISTS idx_receipts_admission_number ON receipts(admission_number);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_date ON receipts(payment_date);
CREATE INDEX IF NOT EXISTS idx_fees_program_name ON fees(program_name);

-- Step 4: Enable RLS (Row Level Security) - Optional but recommended
-- Uncomment if you want to enable RLS

-- ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies for RLS - Optional
-- Uncomment if you enabled RLS above

-- CREATE POLICY "Enable read access for all users" ON fees
-- FOR SELECT
-- USING (true);

-- CREATE POLICY "Enable read access for all users" ON receipts
-- FOR SELECT
-- USING (true);

-- Step 6: Verify tables were created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('fees', 'receipts')
ORDER BY table_name, ordinal_position;
