# Fee Structure by Program - Implementation Guide

## Overview

This feature allows admins to **set and manage fees for different programs**. When creating a receipt and searching by admission number, the **fees are automatically populated based on the student's program**.

## ✨ Key Features

1. **Fee Management Dashboard**: Admin can view, create, edit, and delete program fees
2. **Auto-Population**: Fees automatically populate when searching for a student by admission number
3. **Program-Based Pricing**: Different programs can have different fees (Toddlers, Nursery, Pre-KG, KG)
4. **Database Storage**: All fees are stored in a centralized `fee_structure` table
5. **Responsive UI**: Works seamlessly on desktop, tablet, and mobile

## 📁 Files Created/Modified

### Database
- **`db/create_fee_structure_table.sql`** - SQL migration to create the fee_structure table

### API Routes
- **`src/app/api/admin/fee-structure/route.ts`** - API endpoints for fee management
  - GET: Fetch all fees or specific program fee
  - POST: Create or update fee structure

### Admin Dashboard
- **`src/admin/dashboard/fee-management/page.tsx`** - Fee management UI component
- **`src/admin/dashboard/fee-management/fee-management.module.css`** - Styling for fee management

### Updated Files
- **`src/admin/dashboard/receipt/receipt.tsx`** - Updated to fetch and auto-populate fees
- **`src/admin/navbar/navbar.tsx`** - Added "Fee Management" link to admin menu

## 🚀 How to Use

### Step 1: Set Up Database

1. Open your database console (Supabase/PostgreSQL)
2. Run the SQL migration from `db/create_fee_structure_table.sql`:

```sql
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

INSERT INTO fee_structure (program_name, monthly_fee, annual_fee, registration_fee, description, is_active)
VALUES
    ('Toddlers', 8500.00, 102000.00, 2000.00, 'Ages 2–3', true),
    ('Nursery', 10000.00, 120000.00, 2000.00, 'Ages 3–4', true),
    ('Pre-Kindergarten', 12000.00, 144000.00, 2500.00, 'Ages 4–5', true),
    ('Kindergarten', 14000.00, 168000.00, 3000.00, 'Ages 5–6', true);

CREATE INDEX idx_fee_structure_program_name ON fee_structure(program_name);
```

### Step 2: Configure Fees

1. Go to Admin Dashboard
2. Click on **"Fee Management"** in the sidebar
3. Click **"Add New Program Fee"** to add fees for a new program
4. Fill in the details:
   - **Program Name**: e.g., "Toddlers", "Nursery", "Pre-KG", "Kindergarten"
   - **Monthly Fee** (required): Base monthly fee amount
   - **Annual Fee**: Full year fee (optional)
   - **Registration Fee**: One-time registration fee (optional)
   - **Admission Fee**: One-time admission fee (optional)
   - **Description**: Program details
   - **Active**: Toggle to activate/deactivate program

5. Click **"Save"** to save the fee structure

### Step 3: Create Receipts with Auto-Populated Fees

1. Go to **Receipt Dashboard**
2. **In the Create Modal**:
   - Enter the **Admission Number**
   - Click **"Search"** button
   - The form will auto-populate with:
     - Student Name
     - Parent Name
     - Program
     - **Monthly Fees** (automatically fetched from database)

3. Review the auto-populated fees amount
4. Modify if needed
5. Click **"Create Receipt"** to save

**OR**

1. Go to **Receipt Dashboard** (List View)
2. Use the **Admission Search** card at the top
3. Enter admission number and click **"Search"**
4. System displays:
   - Student details
   - Program info
   - **Monthly Fee for the program**
5. Click **"Add Receipt"** button
6. In the modal, fees will be pre-filled
7. Create receipt

## 📊 Data Structure

### fee_structure Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| program_name | VARCHAR(255) | Unique program name |
| monthly_fee | DECIMAL(10,2) | Monthly fee amount (required) |
| annual_fee | DECIMAL(10,2) | Annual fee amount (optional) |
| registration_fee | DECIMAL(10,2) | Registration fee (optional) |
| admission_fee | DECIMAL(10,2) | Admission fee (optional) |
| other_fees | TEXT | Any other fees (JSON format) |
| description | TEXT | Program description |
| is_active | BOOLEAN | Active status (default: true) |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last updated date |

## 🔌 API Usage

### Get All Active Fees
```bash
GET /api/admin/fee-structure
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "program_name": "Toddlers",
      "monthly_fee": 8500,
      "annual_fee": 102000,
      "registration_fee": 2000,
      "is_active": true,
      ...
    }
  ]
}
```

### Get Fee for Specific Program
```bash
GET /api/admin/fee-structure?program_name=Toddlers
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "program_name": "Toddlers",
    "monthly_fee": 8500,
    "annual_fee": 102000,
    "registration_fee": 2000,
    "is_active": true
  }
}
```

### Create or Update Fee Structure
```bash
POST /api/admin/fee-structure
```

Request Body:
```json
{
  "program_name": "Toddlers",
  "monthly_fee": 8500,
  "annual_fee": 102000,
  "registration_fee": 2000,
  "admission_fee": 1500,
  "description": "Ages 2-3 years",
  "is_active": true
}
```

## 🎯 Workflow Example

### Scenario: Creating a receipt for a Nursery student

1. **Admin opens Receipt Dashboard**
2. **Access Fee Management** (first time setup):
   - Adds program: "Nursery" with monthly fee ₹10,000
   - Saves

3. **Create Receipt**:
   - Clicks "Create Receipt"
   - Modal opens with admission search field
   - Enters admission number: "ADM-2024-001"
   - Clicks Search
   - System fetches:
     - Student Name: "Aarav Kumar"
     - Program: "Nursery"
     - Then queries fee_structure table
     - Finds ₹10,000 monthly fee
   - **Fees Amount field auto-populates with 10000**
   - Admin confirms or modifies other details
   - Clicks "Create Receipt" to save

4. **Receipt is created** with the program's standard fee

## ✅ Benefits

- **Consistency**: Same fee for all students in a program
- **Efficiency**: Admin doesn't need to manually enter fees
- **Flexibility**: Easy to change program fees anytime
- **Error Reduction**: No manual entry errors
- **Audit Trail**: All fees are tracked in database

## ⚙️ Customization

### Add New Program
1. Go to Fee Management
2. Click "Add New Program Fee"
3. Enter program name and fees
4. Save

### Change Program Fees
1. Go to Fee Management
2. Find the program card
3. Click "Edit"
4. Update the amounts
5. Save

### Deactivate Program
1. Go to Fee Management
2. Click "Edit" on the program
3. Uncheck "Active"
4. Save

## 🐛 Troubleshooting

### Fees not auto-populating?
- Ensure program name matches exactly (case-sensitive)
- Check if fee structure is active in database
- Verify API endpoint is working: `/api/admin/fee-structure`

### Program not found in dropdown?
- Go to Fee Management and add the program
- Ensure the program name matches the admission program field

### Wrong fee showing up?
- Check if multiple programs have similar names
- Verify the admission number's program field is correct
- Review fee_structure table for duplicate program names

## 📝 Notes

- Program names are **unique** - can't have duplicates
- Monthly fee is **required** - other fees are optional
- Deactivating a program keeps historical data but prevents new use
- Fees can be updated anytime without affecting past receipts
- All amounts are stored in INR (₹)

## 🔐 Permissions

- Only admins with full access can manage fees
- Tele-callers (role_id = 2) cannot access Fee Management
- All fee changes are logged in the database with timestamps

## 📱 Responsive Design

The fee management page is fully responsive:
- **Desktop**: Grid layout with 3 cards per row
- **Tablet**: 2 cards per row
- **Mobile**: Single column view

All buttons and forms are touch-friendly on mobile devices.

---

**Last Updated**: February 18, 2026
**Version**: 1.0
**Status**: ✅ Ready for Production
