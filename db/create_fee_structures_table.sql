-- Fee Structures Table for storing program-wise fees
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_name TEXT NOT NULL UNIQUE,
    monthly_fee NUMERIC(10, 2) NOT NULL,
    annual_fee NUMERIC(10, 2),
    registration_fee NUMERIC(10, 2),
    admission_fee NUMERIC(10, 2),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on program_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_fee_structures_program_name ON fee_structures(program_name);

-- Create index on is_active for filtering active programs
CREATE INDEX IF NOT EXISTS idx_fee_structures_is_active ON fee_structures(is_active);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

-- Optional: Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fee_structures_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fee_structures_timestamp_trigger ON fee_structures;
CREATE TRIGGER update_fee_structures_timestamp_trigger
BEFORE UPDATE ON fee_structures
FOR EACH ROW
EXECUTE FUNCTION update_fee_structures_timestamp();
