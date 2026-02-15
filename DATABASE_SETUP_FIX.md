# Database Setup Fix - Missing Receipts Table

## Problem
```
Error: Failed to run sql query: ERROR: 42P01: relation "receipts" does not exist
```

The `receipts` table doesn't exist in your Supabase database.

## Solution

### Step 1: Run Complete Database Setup

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open and run the file: `db/setup_complete_receipts_system.sql`
3. This will create:
   - ✅ `fees` table (if missing)
   - ✅ `receipts` table (if missing)
   - ✅ All necessary columns including new admission_fee and uniform_fee
   - ✅ Indexes for performance
   - ✅ Verification query to confirm setup

### Step 2: Verify the Setup

After running the SQL, you should see output like:
```
table_name  | column_name              | data_type
------------|--------------------------|------------------
fees        | id                       | uuid
fees        | program_name             | character varying
fees        | monthly_fee              | numeric
fees        | annual_fee               | numeric
fees        | registration_fee         | numeric
fees        | admission_fee            | numeric
fees        | uniform_fee              | numeric
receipts    | id                       | uuid
receipts    | receipt_number           | character varying
receipts    | student_name             | character varying
receipts    | admission_number         | character varying
receipts    | fees_amount              | numeric
receipts    | registration_fee         | numeric
receipts    | include_registration_fee | boolean
receipts    | admission_fee            | numeric
receipts    | include_admission_fee    | boolean
receipts    | uniform_fee              | numeric
receipts    | include_uniform_fee      | boolean
receipts    | payment_date             | date
receipts    | status                   | character varying
... (and more columns)
```

### Step 3: Test the Connection

1. Go back to your admin panel
2. Click "⚙️ Manage Fees" button
3. Try to add a new fee - it should work now

## Files

### ✅ `db/setup_complete_receipts_system.sql`
**Complete database setup** - Creates both tables from scratch with all columns
- Use this FIRST if tables don't exist
- Safe to run multiple times (uses IF NOT EXISTS)

### ✅ `db/update_fees_table.sql`
**Update existing tables** - Adds new columns to existing tables
- Use this AFTER complete setup for any additional columns
- Referenced for troubleshooting

## Database Schema

### `fees` Table
```
id                    UUID (Primary Key)
program_name          VARCHAR(255) - Unique
description           TEXT
monthly_fee           DECIMAL(10,2)
annual_fee            DECIMAL(10,2)
registration_fee      DECIMAL(10,2)
admission_fee         DECIMAL(10,2) ✨ NEW
uniform_fee           DECIMAL(10,2) ✨ NEW
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

### `receipts` Table
```
id                    UUID (Primary Key)
receipt_number        VARCHAR(50) - Unique
student_name          VARCHAR(255)
admission_number      VARCHAR(50)
parent_name           VARCHAR(255)
parent_phone          VARCHAR(20)
program               VARCHAR(255)
month                 VARCHAR(20)
year                  INTEGER
fees_amount           DECIMAL(10,2)
registration_fee      DECIMAL(10,2)
include_registration_fee BOOLEAN
admission_fee         DECIMAL(10,2) ✨ NEW
include_admission_fee BOOLEAN ✨ NEW
uniform_fee           DECIMAL(10,2) ✨ NEW
include_uniform_fee   BOOLEAN ✨ NEW
payment_mode          VARCHAR(50)
payment_date          DATE
status                VARCHAR(20)
notes                 TEXT
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

## Indexes Created
- `idx_receipts_student_name` - Fast search by student name
- `idx_receipts_admission_number` - Fast search by admission number
- `idx_receipts_status` - Fast filter by status
- `idx_receipts_payment_date` - Fast filter by payment date
- `idx_fees_program_name` - Fast lookup by program name

## Troubleshooting

### Still getting "relation does not exist" error?
1. Check that you're in the correct Supabase project
2. Verify the SQL script ran successfully (look for no errors in output)
3. Try refreshing your browser and the admin panel

### Tables created but getting permission errors?
1. Check your RLS (Row Level Security) policies in Supabase
2. Uncomment the RLS sections in `setup_complete_receipts_system.sql` if needed
3. Contact Supabase support if policies are blocking access

### Need to reset everything?
```sql
-- WARNING: This deletes all data!
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS fees CASCADE;

-- Then run setup_complete_receipts_system.sql again
```

## Success Indicators
✅ Fees modal opens without error
✅ Can create new fees with admission and uniform fees
✅ Can create receipts with all fee types
✅ Receipt printing shows all selected fees
✅ Total amount calculated correctly

