# Admission Form - Database Schema Setup

## Step 1: Create Admission Table in Supabase

### SQL Query to Run in Supabase SQL Editor

```sql
-- Create admission table
CREATE TABLE public.admission (
  -- Primary key and timestamps
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Admission Details
  admission_number VARCHAR(20) UNIQUE NOT NULL, -- Format: ADM-2024-001
  admission_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, confirmed

  -- Child Details
  child_name VARCHAR(255) NOT NULL,
  child_dob DATE NOT NULL,
  child_gender VARCHAR(50), -- male, female, other
  child_place_of_birth VARCHAR(255),

  -- Parent Details
  parent_name VARCHAR(255) NOT NULL,
  parent_mobile_number VARCHAR(20) NOT NULL,
  parent_email VARCHAR(255),

  -- Academic Details
  program_name VARCHAR(255) NOT NULL, -- playgroup, nursery, kg1, kg2, etc
  previous_school VARCHAR(255),

  -- Document URLs (stored in Google Drive)
  photo_url VARCHAR(500),
  birth_certificate_url VARCHAR(500),
  aadhar_card_url VARCHAR(500),
  parent_id_proof_url VARCHAR(500),

  -- Google Drive Folder ID
  google_drive_folder_id VARCHAR(255),

  -- Additional info
  notes TEXT,
  admin_remarks TEXT,

  -- Indexes for faster queries
  CONSTRAINT fk_admission_status CHECK (admission_status IN ('pending', 'approved', 'rejected', 'confirmed'))
);

-- Create indexes for faster queries
CREATE INDEX idx_admission_number ON public.admission(admission_number);
CREATE INDEX idx_admission_status ON public.admission(admission_status);
CREATE INDEX idx_parent_mobile ON public.admission(parent_mobile_number);
CREATE INDEX idx_created_at ON public.admission(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.admission ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for anonymous users)
CREATE POLICY "Allow public insert" ON public.admission
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow select (read) for specific users
CREATE POLICY "Allow public read" ON public.admission
  FOR SELECT
  USING (true);

-- Create policy to allow updates only by authenticated users (for admin)
CREATE POLICY "Allow authenticated update" ON public.admission
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

## Table Structure Overview

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Primary key |
| `admission_number` | VARCHAR | Unique ID (ADM-2024-001) |
| `admission_status` | VARCHAR | pending/approved/rejected/confirmed |
| `child_name` | VARCHAR | Child's full name |
| `child_dob` | DATE | Child's date of birth |
| `child_gender` | VARCHAR | Gender |
| `child_place_of_birth` | VARCHAR | Place of birth |
| `parent_name` | VARCHAR | Parent's full name |
| `parent_mobile_number` | VARCHAR | Contact number |
| `parent_email` | VARCHAR | Email (optional) |
| `program_name` | VARCHAR | Admission program |
| `previous_school` | VARCHAR | Previous school (if any) |
| `photo_url` | VARCHAR | Google Drive URL |
| `birth_certificate_url` | VARCHAR | Google Drive URL |
| `aadhar_card_url` | VARCHAR | Google Drive URL |
| `parent_id_proof_url` | VARCHAR | Google Drive URL |
| `google_drive_folder_id` | VARCHAR | Folder containing all docs |
| `notes` | TEXT | Additional notes |
| `admin_remarks` | TEXT | Admin comments |
| `created_at` | TIMESTAMP | When admission was created |
| `updated_at` | TIMESTAMP | Last update time |

---

## How to Create the Table

### Option 1: Using Supabase UI (Easiest)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Create new query
5. Paste the SQL above
6. Click **Run**
7. Table created! ✅

### Option 2: Using Supabase CLI

```bash
# Create migration
supabase migration new create_admission_table

# Edit the file and add SQL above
# Then run:
supabase db push
```

---

## Folder Structure in Google Drive

```
Admissions/
├── ADM-2024-001/
│   ├── ADM-2024-001_photo.jpg
│   ├── ADM-2024-001_birth_certificate.pdf
│   ├── ADM-2024-001_aadhar_card.pdf
│   └── ADM-2024-001_parent_id_proof.pdf
├── ADM-2024-002/
│   ├── ADM-2024-002_photo.jpg
│   ├── ADM-2024-002_birth_certificate.pdf
│   └── ...
```

---

## File Naming Convention

Files are renamed to: `{ADMISSION_NUMBER}_{DOCUMENT_TYPE}.{extension}`

Examples:
- `ADM-2024-001_photo.jpg`
- `ADM-2024-001_birth_certificate.pdf`
- `ADM-2024-001_aadhar_card.pdf`
- `ADM-2024-001_parent_id_proof.pdf`

---

## Admission Number Format

Generated as: `ADM-YYYY-NNNNN`

Example:
- `ADM-2024-00001` (First admission of 2024)
- `ADM-2024-00002` (Second admission of 2024)

---

## Next Steps

1. ✅ Create this table in Supabase
2. Create utility functions for admission operations
3. Build API endpoint for form submission
4. Create React form component
5. Generate PDF confirmation slip
6. Build admin dashboard

---

**After running the SQL above, move to next step!** 🚀
