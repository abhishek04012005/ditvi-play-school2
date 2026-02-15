# 🔧 Quick Fix - Missing Receipts Table

## The Error
```
ERROR: 42P01: relation "receipts" does not exist
```

## The Fix (2 minutes)

### 1️⃣ Open Supabase Dashboard
- Go to your Supabase project
- Click **SQL Editor** in left sidebar

### 2️⃣ Copy & Paste This SQL
```sql
-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    annual_fee DECIMAL(10, 2) NOT NULL,
    registration_fee DECIMAL(10, 2) DEFAULT 0,
    admission_fee DECIMAL(10, 2) DEFAULT 0,
    uniform_fee DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create receipts table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_receipts_student_name ON receipts(student_name);
CREATE INDEX IF NOT EXISTS idx_receipts_admission_number ON receipts(admission_number);
CREATE INDEX IF NOT EXISTS idx_receipts_status ON receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_payment_date ON receipts(payment_date);
CREATE INDEX IF NOT EXISTS idx_fees_program_name ON fees(program_name);
```

### 3️⃣ Click Run
- The SQL will execute
- You'll see a success message

### 4️⃣ Test It
- Go back to admin panel
- Click "⚙️ Manage Fees"
- Try creating a fee
- ✅ Should work now!

## What This Does
✅ Creates `fees` table with all columns  
✅ Creates `receipts` table with all columns  
✅ Adds indexes for fast searches  
✅ Includes all new fee fields (admission, uniform)  

## Result
- 📋 Fees Management modal works
- 📝 Receipt creation works
- 💰 All fee types supported
- 🖨️ Receipt printing works

**That's it! Your system is ready.** 🎉

