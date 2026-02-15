# Complete Fees Management System Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [System Overview](#system-overview)
3. [Database Setup](#database-setup)
4. [Features](#features)
5. [Usage Guide](#usage-guide)
6. [Integration](#integration)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Database Setup (5 minutes)

**Location:** Supabase SQL Editor → Run this file:
- `db/fees_management_setup.sql`

**Or copy-paste these scripts:**

```sql
-- Script 1: Create table
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

-- Script 2: Insert default data
INSERT INTO fees (program_name, description, monthly_fee, annual_fee, registration_fee) VALUES
    ('Play Group', 'Age: 1.5 - 2.5 years', 6000, 72000, 2000),
    ('Nursery', 'Age: 2.5 - 3.5 years', 7000, 84000, 2500),
    ('Junior KG', 'Age: 3.5 - 4.5 years', 8000, 96000, 3000),
    ('Senior KG', 'Age: 4.5 - 5.5 years', 9000, 108000, 3500)
ON CONFLICT DO NOTHING;

-- Script 3: Link receipts
ALTER TABLE fee_receipts 
ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL;
```

### 2. Access the Dashboard

**URL:** `http://localhost:3000/admin/dashboard/fees`

**What you'll see:**
- Table of all programs and their fees
- Add/Edit/Delete buttons
- Search bar
- Currency formatting (₹)

---

## 🎯 System Overview

### Architecture

```
┌─────────────────────────────────────────┐
│   ADMIN DASHBOARD (Next.js Frontend)    │
├─────────────────────────────────────────┤
│  Fees Management Page                   │
│  (/admin/dashboard/fees)                │
│  - CRUD Operations                      │
│  - Real-time Updates                    │
│  - Search & Filter                      │
└──────────────────┬──────────────────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │   Supabase Client    │
        │  (React Hooks)       │
        └──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   SUPABASE DATABASE (PostgreSQL)        │
├─────────────────────────────────────────┤
│  fees table                             │
│  - program_name, monthly_fee, etc.      │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   RECEIPT DASHBOARD                     │
├─────────────────────────────────────────┤
│  Receipt Management                     │
│  - Auto-populate fees                   │
│  - Switch fee types                     │
│  - Create receipts                      │
└─────────────────────────────────────────┘
```

### Data Model

```
fees (Table)
├── id: UUID (Primary Key)
├── program_name: VARCHAR(255) [UNIQUE]
├── description: TEXT
├── monthly_fee: DECIMAL(10,2)
├── annual_fee: DECIMAL(10,2)
├── registration_fee: DECIMAL(10,2)
├── is_active: BOOLEAN [DEFAULT true]
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP [AUTO-UPDATE]
```

---

## 💾 Database Setup

### Prerequisites
- Supabase project created
- `fee_receipts` table exists
- Admin access to Supabase console

### Step-by-Step Setup

**Step 1:** Open Supabase SQL Editor

**Step 2:** Create fees table
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

CREATE INDEX idx_fees_program_name ON fees(program_name);
```

**Step 3:** Insert default fees
```sql
INSERT INTO fees (program_name, description, monthly_fee, annual_fee, registration_fee) 
VALUES
    ('Play Group', 'Age: 1.5 - 2.5 years', 6000, 72000, 2000),
    ('Nursery', 'Age: 2.5 - 3.5 years', 7000, 84000, 2500),
    ('Junior KG', 'Age: 3.5 - 4.5 years', 8000, 96000, 3000),
    ('Senior KG', 'Age: 4.5 - 5.5 years', 9000, 108000, 3500)
ON CONFLICT DO NOTHING;
```

**Step 4:** Link with receipts table
```sql
ALTER TABLE fee_receipts 
ADD COLUMN IF NOT EXISTS fee_id UUID REFERENCES fees(id) ON DELETE SET NULL;
```

**Step 5:** Add auto-update trigger
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

### Verification

Check if setup was successful:
```sql
-- View all fees
SELECT * FROM fees;

-- Count fees
SELECT COUNT(*) FROM fees;

-- Check fee_receipts has fee_id column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'fee_receipts' AND column_name = 'fee_id';
```

---

## ✨ Features

### Fees Management Dashboard

#### Create Fee
1. Click "Add New Fee" button
2. Fill in form:
   - Program Name (required, unique)
   - Description (optional)
   - Monthly Fee (required)
   - Annual Fee (required)
   - Registration Fee (required)
3. Click "Create Fee"
4. Success notification appears

#### Edit Fee
1. Click edit icon (pencil) next to program
2. Modal opens with current values
3. Update values (program name cannot change)
4. Click "Update Fee"
5. Changes saved immediately

#### Delete Fee
1. Click delete icon (trash) next to program
2. Confirmation dialog appears
3. Click "OK" to confirm
4. Fee deleted from database

#### Search Fees
1. Type in search box
2. Results filter in real-time
3. Search by program name or description

### Receipt Dashboard Integration

#### Auto-Populate Fees
1. Create new receipt
2. Select program from dropdown
3. System fetches fees from database
4. Monthly fee auto-populates
5. Amount shows in INR currency format

#### Switch Fee Type
1. Select different fee type from dropdown
2. Amount updates automatically
3. Options: Monthly, Annual, Registration

#### View All Fees
1. Scroll to bottom of receipt page
2. See all programs and their current fees
3. Reference for manual entries

---

## 🎓 Usage Guide

### For Admins

#### Managing Fees

**Add New Program:**
```
1. Go to /admin/dashboard/fees
2. Click "Add New Fee"
3. Program Name: "Advanced Preschool"
4. Description: "Age: 2.0 - 2.5 years"
5. Monthly: 8500
6. Annual: 102000
7. Registration: 3500
8. Click "Create Fee"
```

**Update Existing Fee:**
```
1. Find program in table
2. Click edit icon
3. Change values
4. Click "Update Fee"
```

**Delete a Program:**
```
1. Find program in table
2. Click delete icon
3. Confirm deletion
4. Done
```

#### Creating Receipts

**With Auto-Population:**
```
1. Go to /admin/dashboard/receipt
2. Search admission number
3. Click "Add Receipt"
4. Select program: "Nursery"
5. Fee amount auto-fills: ₹7,000
6. Select fee type: "Monthly" (default)
7. Fill other details
8. Submit receipt
```

**Manual Entry:**
```
1. Go to /admin/dashboard/receipt
2. Fill all fields manually
3. Select program
4. Amount auto-populates
5. Adjust if needed
6. Submit receipt
```

---

## 🔗 Integration

### Frontend Components

**Fees Management Component**
- Location: `src/admin/dashboard/feesmanagement/feesmanagement.tsx`
- Handles: Create, Read, Update, Delete operations
- State: React hooks (useState, useEffect)
- API: Supabase client

**Receipt Dashboard Component**
- Location: `src/admin/dashboard/receipt/receipt.tsx`
- Enhanced: Fetches fees from Supabase
- Auto-populates: Fee amounts on program selection
- Displays: All programs and fees reference

**Pages**
- Fees: `src/app/admin/dashboard/fees/page.tsx`
- Receipt: `src/app/admin/dashboard/receipt/[id]/page.tsx`

### API Operations

```typescript
// Fetch all active fees
const { data, error } = await supabase
    .from('fees')
    .select('*')
    .eq('is_active', true);

// Create fee
await supabase
    .from('fees')
    .insert([{ program_name, description, monthly_fee, ... }]);

// Update fee
await supabase
    .from('fees')
    .update({ monthly_fee, annual_fee, ... })
    .eq('id', feeId);

// Delete fee
await supabase
    .from('fees')
    .delete()
    .eq('id', feeId);
```

---

## 🔧 Troubleshooting

### Common Issues

**Issue: Fees not showing in Receipt Dashboard**
```
Solution:
1. Check if is_active = true for the fee
2. Refresh the page
3. Clear browser cache (Ctrl+Shift+Del)
4. Check browser console for errors
5. Verify Supabase connection
```

**Issue: Can't create new fee with duplicate name**
```
Solution:
1. Check if program already exists
2. Use unique program name
3. Or edit existing program instead
4. Note: Program names are case-sensitive
```

**Issue: Fees not updating in receipt form**
```
Solution:
1. Wait 2-3 seconds for data sync
2. Refresh the page
3. Reload browser completely
4. Check network tab for failed requests
```

**Issue: Database connection error**
```
Solution:
1. Check Supabase credentials in .env.local
2. Verify SUPABASE_URL and SUPABASE_ANON_KEY
3. Ensure Supabase project is active
4. Check network connectivity
5. Try again after 30 seconds
```

**Issue: Can't edit or delete fees**
```
Solution:
1. Check admin permissions
2. Ensure you're logged in
3. Verify RLS policies (if enabled)
4. Check browser console for errors
5. Try in incognito mode
```

### Debug Tips

**Check Network Requests:**
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform action (create/edit/delete)
4. Check request/response
5. Look for error messages
```

**Check Browser Console:**
```
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red error messages
4. Copy error for support
```

**Check Database:**
```sql
-- Verify fees table
SELECT * FROM fees;

-- Check for errors
SELECT * FROM fees WHERE program_name = 'Play Group';

-- Count records
SELECT COUNT(*) FROM fees;
```

---

## 📚 File Reference

### New Files
| File | Purpose |
|------|---------|
| `src/admin/dashboard/feesmanagement/feesmanagement.tsx` | Main component |
| `src/admin/dashboard/feesmanagement/feesmanagement.module.css` | Styles |
| `src/app/admin/dashboard/fees/page.tsx` | Route page |
| `db/fees_management_setup.sql` | Complete SQL setup |
| `FEES_MANAGEMENT_SETUP.md` | Detailed guide |
| `FEES_MANAGEMENT_QUICK_GUIDE.md` | Quick reference |
| `FEES_MANAGEMENT_IMPLEMENTATION.md` | Implementation summary |

### Modified Files
| File | Changes |
|------|---------|
| `src/admin/dashboard/receipt/receipt.tsx` | Fetch fees from Supabase |
| `src/json/schooldetails-eng.ts` | Added fee properties |
| `src/types/schooldetails-types.ts` | Extended types |

---

## ✅ Verification Checklist

- [ ] Database table created successfully
- [ ] Default fees inserted
- [ ] fee_receipts linked to fees table
- [ ] Fees dashboard loads at `/admin/dashboard/fees`
- [ ] Can create a new fee
- [ ] Can edit existing fee
- [ ] Can delete a fee
- [ ] Search functionality works
- [ ] Receipt auto-populates on program selection
- [ ] Fee type switching works
- [ ] Currency formatting correct (₹)
- [ ] Mobile responsive design works
- [ ] No console errors

---

## 🎯 Next Steps

1. ✅ Run SQL scripts
2. ✅ Access fees dashboard
3. ✅ Create test fee entry
4. ✅ Test receipt integration
5. ✅ Train admin users
6. ✅ Monitor in production

---

## 📞 Support

For issues or questions:
1. Check this guide
2. Review component source code
3. Check browser console for errors
4. Check Supabase logs
5. Verify database state

---

**Last Updated:** February 2026
**Status:** Production Ready ✅
**Version:** 1.0
