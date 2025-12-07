# Quick Supabase Queries for Blood Group & Address

## Execute These Queries in Supabase SQL Editor

### Query 1: Add Blood Group Column
```sql
ALTER TABLE admission
ADD COLUMN IF NOT EXISTS child_blood_group VARCHAR(5) NULL;
```

### Query 2: Add Address Column
```sql
ALTER TABLE admission
ADD COLUMN IF NOT EXISTS parent_address TEXT NULL;
```

### Query 3: Add Index (Optional but Recommended)
```sql
CREATE INDEX IF NOT EXISTS idx_admission_parent_address ON admission (parent_address);
```

### Query 4: Verify Columns Created
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admission' 
AND column_name IN ('child_blood_group', 'parent_address')
ORDER BY column_name;
```

---

## Copy-Paste All at Once (Recommended)

```sql
-- Add blood group column (Optional)
ALTER TABLE admission
ADD COLUMN IF NOT EXISTS child_blood_group VARCHAR(5) NULL;

-- Add address column (Compulsory)
ALTER TABLE admission
ADD COLUMN IF NOT EXISTS parent_address TEXT NULL;

-- Add index for address column
CREATE INDEX IF NOT EXISTS idx_admission_parent_address ON admission (parent_address);

-- Verify columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admission' 
AND column_name IN ('child_blood_group', 'parent_address')
ORDER BY column_name;
```

---

## Blood Group Options

| Value | Display |
|-------|---------|
| O+ | O+ |
| O- | O- |
| A+ | A+ |
| A- | A- |
| B+ | B+ |
| B- | B- |
| AB+ | AB+ |
| AB- | AB- |

---

## Field Summary

| Field | Type | Required | Location | UI Type |
|-------|------|----------|----------|---------|
| child_blood_group | VARCHAR(5) | No | Step 1 | Dropdown |
| parent_address | TEXT | Yes | Step 2 | Textarea |

---

## Verification Query

After running migrations, check that both columns exist:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'admission' 
AND column_name IN ('child_blood_group', 'parent_address', 'parent_name', 'parent_mobile_number')
ORDER BY ordinal_position DESC
LIMIT 6;
```

Expected result:
- `parent_id_proof_url` (existing)
- `parent_address` (NEW - TEXT, nullable)
- `child_blood_group` (NEW - VARCHAR(5), nullable)
- `parent_mobile_number` (existing)
- `parent_name` (existing)
- `parent_email` (existing)
