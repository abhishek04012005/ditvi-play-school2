-- Create fees table
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

-- Create index on program_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_fees_program_name ON fees(program_name);

-- Insert default fee structure
INSERT INTO fees (program_name, description, monthly_fee, annual_fee, registration_fee) VALUES
    ('Play Group', 'Age: 1.5 - 2.5 years', 6000, 72000, 2000),
    ('Nursery', 'Age: 2.5 - 3.5 years', 7000, 84000, 2500),
    ('Junior KG', 'Age: 3.5 - 4.5 years', 8000, 96000, 3000),
    ('Senior KG', 'Age: 4.5 - 5.5 years', 9000, 108000, 3500)
ON CONFLICT DO NOTHING;

-- Add fee_id column to fee_receipts table to link with fees table
ALTER TABLE fee_receipts 
ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for fees table
DROP TRIGGER IF EXISTS update_fees_timestamp ON fees;
CREATE TRIGGER update_fees_timestamp
BEFORE UPDATE ON fees
FOR EACH ROW
EXECUTE FUNCTION update_fees_updated_at();
