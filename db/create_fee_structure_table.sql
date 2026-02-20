-- Create fee_structure table to store program-wise fees
CREATE TABLE IF NOT EXISTS fee_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name VARCHAR(255) NOT NULL UNIQUE,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    annual_fee DECIMAL(10, 2),
    registration_fee DECIMAL(10, 2),
    admission_fee DECIMAL(10, 2),
    other_fees TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default fees based on schooldetails.ts
INSERT INTO fee_structure (
    program_name,
    monthly_fee,
    annual_fee,
    registration_fee,
    description,
    is_active
) VALUES
    ('Toddlers', 8500.00, 102000.00, 2000.00, 'Ages 2–3. Sensory play & bonding with certified caregivers', true),
    ('Nursery', 10000.00, 120000.00, 2000.00, 'Ages 3–4. Foundation learning & routine building', true),
    ('Pre-Kindergarten', 12000.00, 144000.00, 2500.00, 'Ages 4–5. Pre-academics & literacy foundation', true),
    ('Kindergarten', 14000.00, 168000.00, 3000.00, 'Ages 5–6. School readiness & academic skills', true)
ON CONFLICT (program_name) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fee_structure_program_name ON fee_structure(program_name);
