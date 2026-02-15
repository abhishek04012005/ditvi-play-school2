# Fees Management System - Complete Setup Guide

## Overview
The fees management system allows admins to dynamically manage program fees through the admin dashboard. All fees are stored in Supabase and can be edited, created, or deleted by administrators.

## Database Schema

### Table: `fees`
```sql
CREATE TABLE fees (
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
```

### Table: `fee_receipts` (Updated)
The existing `fee_receipts` table has been updated to link with the `fees` table:
```sql
ALTER TABLE fee_receipts 
ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL;
```

## SQL Setup Instructions

### Execute in Supabase SQL Editor:

1. **Create the fees table:**
```sql
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
```

2. **Insert default fee structure:**
```sql
INSERT INTO fees (program_name, description, monthly_fee, annual_fee, registration_fee) VALUES
    ('Play Group', 'Age: 1.5 - 2.5 years', 6000, 72000, 2000),
    ('Nursery', 'Age: 2.5 - 3.5 years', 7000, 84000, 2500),
    ('Junior KG', 'Age: 3.5 - 4.5 years', 8000, 96000, 3000),
    ('Senior KG', 'Age: 4.5 - 5.5 years', 9000, 108000, 3500)
ON CONFLICT DO NOTHING;
```

3. **Link with fee_receipts table:**
```sql
-- Add fee_id column to fee_receipts table to link with fees table
ALTER TABLE fee_receipts 
ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL;
```

4. **Create auto-update trigger for updated_at:**
```sql
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
```

## Features

### 1. Fees Management Dashboard
**Location:** `/admin/dashboard/fees`

**Features:**
- View all programs and their fees in a table format
- Search programs by name or description
- Add new program fees
- Edit existing program fees
- Delete program fees
- Real-time display of all fees in currency format

**Components:**
- [src/admin/dashboard/feesmanagement/feesmanagement.tsx](../src/admin/dashboard/feesmanagement/feesmanagement.tsx)
- [src/admin/dashboard/feesmanagement/feesmanagement.module.css](../src/admin/dashboard/feesmanagement/feesmanagement.module.css)

### 2. Receipt Dashboard Integration
**Location:** `/admin/dashboard/receipt`

**Features:**
- Automatically fetch fees from Supabase `fees` table
- Auto-populate fee amount when program is selected
- Support for multiple fee types (Monthly, Annual, Registration)
- Display all available programs with their fee information

**Updated Files:**
- [src/admin/dashboard/receipt/receipt.tsx](../src/admin/dashboard/receipt/receipt.tsx)

## How It Works

### Admin Fees Management Flow:
1. Admin navigates to `/admin/dashboard/fees`
2. Click "Add New Fee" button to create a new program fee
3. Fill in program name, description, and all fee amounts
4. Click "Create Fee" to save to Supabase
5. Admin can edit fees by clicking the edit icon
6. Admin can delete fees by clicking the delete icon

### Receipt Dashboard Fee Auto-Population:
1. Admin creates a new receipt
2. Selects a program from the dropdown
3. System fetches the selected program's fees from Supabase
4. Fee amount is automatically populated based on selected fee type
5. Fees can be manually adjusted if needed

## Data Flow Diagram

```
Supabase DB (fees table)
         ↓
  ┌──────────────────────┐
  │  FeesManagement      │
  │  Component           │
  │  - CRUD Operations   │
  │  - Display Fees      │
  └──────────────────────┘
         ↓
  ┌──────────────────────┐
  │  Receipt Dashboard   │
  │  - Load Fees         │
  │  - Auto-populate     │
  │  - Fee Type Change   │
  └──────────────────────┘
         ↓
  Supabase DB (fee_receipts table)
```

## API Endpoints Used

All communication is through Supabase client:

```javascript
// Fetch all fees
supabase.from('fees').select('*').eq('is_active', true)

// Create new fee
supabase.from('fees').insert([feeData])

// Update fee
supabase.from('fees').update(feeData).eq('id', id)

// Delete fee
supabase.from('fees').delete().eq('id', id)
```

## Table Structure Example

| program_name | description | monthly_fee | annual_fee | registration_fee | is_active | created_at | updated_at |
|--------------|-------------|-------------|-----------|-----------------|-----------|-----------|-----------|
| Play Group | Age: 1.5 - 2.5 years | 6000 | 72000 | 2000 | true | 2024-01-01 | 2024-01-01 |
| Nursery | Age: 2.5 - 3.5 years | 7000 | 84000 | 2500 | true | 2024-01-01 | 2024-01-01 |
| Junior KG | Age: 3.5 - 4.5 years | 8000 | 96000 | 3000 | true | 2024-01-01 | 2024-01-01 |
| Senior KG | Age: 4.5 - 5.5 years | 9000 | 108000 | 3500 | true | 2024-01-01 | 2024-01-01 |

## Important Notes

1. **Program Name is Unique:** Each program name can only exist once in the fees table
2. **is_active Flag:** Only fees with `is_active = true` are shown in the receipt dashboard
3. **Auto-update Timestamp:** The `updated_at` column automatically updates when fees are modified
4. **Fee Format:** All fees are stored as DECIMAL(10, 2) - support for rupees with paisa
5. **Receipt Link:** Optional foreign key relationship to link receipts with specific fee records

## Validation Rules

- Program name: Required, must be unique
- Monthly fee: Required, must be > 0
- Annual fee: Required, must be > 0
- Registration fee: Required, must be > 0
- Description: Optional

## Error Handling

- Duplicate program name: Shows "This program name already exists"
- Failed creation: Shows "Failed to create fee"
- Failed update: Shows "Failed to update fee"
- Failed delete: Shows "Failed to delete fee"
- Failed fetch: Shows "Failed to fetch fees"

## Future Enhancements

1. Add batch import/export of fees
2. Add fee history and version tracking
3. Add fee effective date ranges
4. Add discount management
5. Add fee category management
6. Generate fee reports and analytics

## File Structure

```
src/
├── admin/
│   └── dashboard/
│       ├── feesmanagement/
│       │   ├── feesmanagement.tsx
│       │   └── feesmanagement.module.css
│       └── receipt/
│           ├── receipt.tsx
│           └── receipt.module.css
├── app/
│   └── admin/
│       └── dashboard/
│           └── fees/
│               └── page.tsx
└── json/
    └── schooldetails-eng.ts (no longer used for fees)

db/
└── create_fees_table.sql
```

## Environment Setup

Ensure your `.env.local` has Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Testing Checklist

- [ ] Create a new fee entry
- [ ] Edit an existing fee entry
- [ ] Delete a fee entry
- [ ] Search for fees
- [ ] Create receipt and verify fee auto-population
- [ ] Change fee type and verify amount updates
- [ ] Verify fees display with Indian currency format (₹)
- [ ] Test on mobile devices for responsive design
