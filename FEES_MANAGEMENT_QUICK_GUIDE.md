# Fees Management - Quick Reference

## Copy & Paste SQL Scripts

### Script 1: Create Fees Table (Run this first)
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

CREATE INDEX IF NOT EXISTS idx_fees_program_name ON fees(program_name);
```

### Script 2: Insert Default Fees
```sql
INSERT INTO fees (program_name, description, monthly_fee, annual_fee, registration_fee) VALUES
    ('Play Group', 'Age: 1.5 - 2.5 years', 6000, 72000, 2000),
    ('Nursery', 'Age: 2.5 - 3.5 years', 7000, 84000, 2500),
    ('Junior KG', 'Age: 3.5 - 4.5 years', 8000, 96000, 3000),
    ('Senior KG', 'Age: 4.5 - 5.5 years', 9000, 108000, 3500)
ON CONFLICT DO NOTHING;
```

### Script 3: Link Receipt Table (Run after fee_receipts exists)
```sql
ALTER TABLE fee_receipts 
ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL;
```

### Script 4: Add Auto-Update Trigger
```sql
CREATE OR REPLACE FUNCTION update_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fees_timestamp ON fees;
CREATE TRIGGER update_fees_timestamp
BEFORE UPDATE ON fees
FOR EACH ROW
EXECUTE FUNCTION update_fees_updated_at();
```

## Quick Access URLs

- **Fees Management Dashboard:** `/admin/dashboard/fees`
- **Receipt Dashboard:** `/admin/dashboard/receipt`

## Key Features

### Fees Management Page
- ✅ Add new program fees
- ✅ Edit existing fees
- ✅ Delete program fees
- ✅ Search by program name or description
- ✅ View all fees in table format
- ✅ Real-time updates

### Receipt Dashboard
- ✅ Auto-fetch all programs with their fees
- ✅ Auto-populate fee amount when program selected
- ✅ Switch between monthly/annual/registration fees
- ✅ Display all programs and their fees at bottom
- ✅ Link receipts with selected fees

## New Files Created

1. **[src/admin/dashboard/feesmanagement/feesmanagement.tsx](../src/admin/dashboard/feesmanagement/feesmanagement.tsx)**
   - Main component for managing fees
   - CRUD operations
   - Search functionality

2. **[src/admin/dashboard/feesmanagement/feesmanagement.module.css](../src/admin/dashboard/feesmanagement/feesmanagement.module.css)**
   - Styling for fees management page
   - Responsive design

3. **[src/app/admin/dashboard/fees/page.tsx](../src/app/admin/dashboard/fees/page.tsx)**
   - Next.js page routing for fees management

4. **[db/create_fees_table.sql](../db/create_fees_table.sql)**
   - Complete SQL setup for fees table

## Modified Files

1. **[src/admin/dashboard/receipt/receipt.tsx](../src/admin/dashboard/receipt/receipt.tsx)**
   - Updated to fetch fees from Supabase instead of hardcoded values
   - Added fetchFees function
   - Updated handleProgramChange to use Supabase data
   - Updated fee dropdown and fee structure section

## Workflow

### For Admins:

**Creating/Editing Fees:**
1. Go to `/admin/dashboard/fees`
2. Click "Add New Fee" (or Edit button for existing)
3. Enter program details and all fee amounts
4. Click "Create Fee" or "Update Fee"

**Creating Receipts:**
1. Go to `/admin/dashboard/receipt`
2. Select a student by admission number (or create manually)
3. Select program from dropdown
4. Fee amount auto-fills based on selected fee type
5. Create receipt

## Database Schema

```
fees table:
├── id (UUID, Primary Key)
├── program_name (VARCHAR, UNIQUE)
├── description (TEXT)
├── monthly_fee (DECIMAL)
├── annual_fee (DECIMAL)
├── registration_fee (DECIMAL)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Important Notes

⚠️ **Before running SQL scripts:**
- Ensure your `fee_receipts` table exists
- Back up your database
- Run scripts in the order provided

⚠️ **Fee Updates:**
- Program name cannot be changed once created (delete and recreate)
- Only active fees are shown in receipt dashboard
- All amounts in Indian Rupees (₹)

⚠️ **Data Integrity:**
- Deleting a fee doesn't affect existing receipts
- Updated_at timestamp auto-updates on every modification
- Each program name is unique per school

## Troubleshooting

**Issue:** Fees not showing in Receipt Dashboard
- Check if `is_active = true` for the fee
- Verify fees table was created
- Clear browser cache

**Issue:** Can't create receipt after fee changes
- Wait a moment for data sync
- Refresh the page
- Check browser console for errors

**Issue:** Duplicate program name error
- Program names must be unique
- Edit existing fee instead of creating new one
- Check spelling exactly matches existing record

## Support

For detailed information, see:
- [FEES_MANAGEMENT_SETUP.md](../FEES_MANAGEMENT_SETUP.md) - Complete setup guide
- Component source files for implementation details
