# Database Setup Required - Receipts Table Missing

## Problem
The app is trying to fetch receipts from a `receipts` table that doesn't exist in your Supabase database yet.

## Solution - Quick Setup (2 minutes)

### Step 1: Go to Supabase SQL Editor
1. Open [Supabase](https://supabase.com)
2. Go to your playschool project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Copy & Run the SQL
Copy the entire contents of this file:
```
db/setup_complete_receipts_system.sql
```

Paste it into the SQL editor and click **RUN**

### Step 3: Verify
The query output should show the `receipts` and `fees` tables with all columns.

### Step 4: Refresh Admin Panel
1. Go back to your admin panel
2. Refresh the page
3. Navigate to **Receipt Management**
4. It should now load without errors ✅

## What Gets Created

**fees table:**
- id, program_name, description
- monthly_fee, annual_fee, registration_fee
- admission_fee, uniform_fee
- timestamps

**receipts table:**
- id, receipt_number, student_name, admission_number
- parent_name, parent_phone, program, month, year
- fees_amount, registration_fee, include_registration_fee
- admission_fee, include_admission_fee
- uniform_fee, include_uniform_fee
- payment_mode, payment_date, status, notes
- timestamps
- 4 performance indexes

## Still Getting Error After Running SQL?

Make sure you:
1. ✅ Ran the **complete** SQL script (copy entire file)
2. ✅ Clicked **RUN** button (not just pasting)
3. ✅ Got success message (check for any error messages)
4. ✅ Refreshed the page in your browser
5. ✅ Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
