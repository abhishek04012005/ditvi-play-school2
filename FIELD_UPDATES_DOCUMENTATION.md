# Supabase & Frontend Updates: Blood Group & Address Fields

## Summary of Changes

Added two new fields to the admission form:
1. **Child Blood Group** (Optional) - Dropdown with 8 blood group options
2. **Parent Address** (Compulsory) - Textarea for complete address

---

## Database Changes (Supabase)

### Migration File
**Location**: `supabase_migrations/add_blood_group_and_address.sql`

### SQL Queries to Run

#### 1. Add Child Blood Group Column (Optional)
```sql
ALTER TABLE admission
ADD COLUMN IF NOT EXISTS child_blood_group VARCHAR(5) NULL;

COMMENT ON COLUMN admission.child_blood_group IS 'Child blood group (optional): O+, O-, A+, A-, B+, B-, AB+, AB-';
```

#### 2. Add Parent Address Column (Compulsory)
```sql
ALTER TABLE admission
ADD COLUMN IF NOT EXISTS parent_address TEXT NULL;

COMMENT ON COLUMN admission.parent_address IS 'Complete address of parent (compulsory): includes street, city, state, postal code';
```

#### 3. Create Index for Search Performance (Optional but Recommended)
```sql
CREATE INDEX IF NOT EXISTS idx_admission_parent_address ON admission (parent_address);
```

#### 4. Verify the Changes
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admission' 
AND column_name IN ('child_blood_group', 'parent_address');
```

### Expected Output
```
column_name        | data_type | is_nullable
-------------------+-----------+------------
child_blood_group  | character | YES
parent_address     | text      | YES
```

---

## Frontend Changes

### 1. Form Data Interface (`admissionform.tsx`)
Added two new fields to `FormData`:
```typescript
interface FormData {
  // ... existing fields ...
  child_blood_group: string;    // Optional blood group
  parent_address: string;        // Compulsory address
}
```

### 2. Form Initialization
```typescript
const [formData, setFormData] = useState<FormData>({
  // ... existing fields ...
  child_blood_group: "",
  parent_address: "",
});
```

### 3. Blood Group Input (Step 1 - Child Details)
**Location**: Step 1 form section
**Type**: Dropdown select
**Options**: O+, O-, A+, A-, B+, B-, AB+, AB-
**Required**: No (Optional)
**Label**: "Blood Group (Optional)"

```tsx
<select
  name="child_blood_group"
  value={formData.child_blood_group}
  onChange={handleInputChange}
  className={styles.selectInput}
>
  <option value="">-- Select Blood Group --</option>
  <option value="O+">O+</option>
  <option value="O-">O-</option>
  <option value="A+">A+</option>
  <option value="A-">A-</option>
  <option value="B+">B+</option>
  <option value="B-">B-</option>
  <option value="AB+">AB+</option>
  <option value="AB-">AB-</option>
</select>
```

### 4. Address Input (Step 2 - Parent Details)
**Location**: Step 2 form section (after Email field)
**Type**: Textarea
**Required**: Yes (Compulsory)
**Label**: "Address *"
**Placeholder**: "Enter complete address (street, city, state, postal code)"
**Rows**: 3

```tsx
<textarea
  name="parent_address"
  value={formData.parent_address}
  onChange={handleInputChange}
  placeholder="Enter complete address (street, city, state, postal code)"
  rows={3}
  required
  className={styles.textarea}
/>
```

### 5. Validation Logic
**File**: `admissionform.tsx` - `validateStep()` function

#### Blood Group (Optional - No validation needed)
- User can skip this field
- If provided, stored as-is

#### Address (Compulsory - Validation required)
```typescript
if (!formData.parent_address.trim()) {
  errors.push("Address is required");
  fieldErrors.parent_address = "Address is required";
}
```

---

## API Changes

### 1. Form Data Submission (`admissionform.tsx`)
When form is submitted, both fields are appended to FormData:

```typescript
// Add blood group if provided
if (formData.child_blood_group) {
  formDataToSend.append("child_blood_group", formData.child_blood_group);
}

// Add address (always required)
formDataToSend.append("parent_address", formData.parent_address);
```

### 2. API Route (`/api/admission/route.ts`)
Extract fields from FormData:
```typescript
const child_blood_group = (formData.get('child_blood_group') as string) || undefined;
const parent_address = formData.get('parent_address') as string;
```

Add validation:
```typescript
if (!parent_address?.trim()) errors.push('Parent address is required');
```

Pass to database:
```typescript
const admissionRecord = await saveAdmissionToDatabase({
  // ... existing fields ...
  child_blood_group,
  parent_address,
  // ... rest of fields ...
});
```

### 3. Database Service (`lib/admission.ts`)
Updated `saveAdmissionToDatabase()` function signature:
```typescript
export const saveAdmissionToDatabase = async (admissionData: {
  // ... existing fields ...
  child_blood_group?: string;
  parent_address: string;
  // ... rest of fields ...
}): Promise<any>
```

---

## Styling

### CSS Classes Added (`admissionform.module.css`)

#### `.selectInput` Class
- Styled dropdown for blood group field
- Includes custom arrow icon
- Focus states with shadow
- Background gradient matching form theme

#### `.textarea` Class
- Styled textarea for address field
- Minimum height: 120px
- Resize: vertical only
- Focus states with shadow
- Background gradient matching form theme

---

## Form Flow Summary

### Step 1: Child Details
- Child Name *
- Date of Birth *
- Gender * (Radio buttons)
- Place of Birth *
- **Blood Group** (Optional - NEW)

### Step 2: Parent Details
- Parent Name *
- Mobile Number *
- Email (Optional)
- **Address * (NEW)**

### Step 3: Academic Details
- Program * (Radio buttons)
- Previous School (Optional)

### Step 4: Documents Upload
- Photo Upload (Optional)
- Birth Certificate (Optional)
- Aadhar Card (Optional)
- Parent ID Proof (Optional)

---

## Data Types Reference

| Field | Type | Required | Length | Values |
|-------|------|----------|--------|--------|
| child_blood_group | VARCHAR(5) | No | 5 | O+, O-, A+, A-, B+, B-, AB+, AB- |
| parent_address | TEXT | Yes | Unlimited | Any text (address format) |

---

## Testing Checklist

- [ ] Blood group dropdown appears on Step 1 with all 8 options
- [ ] Blood group is optional (form submits without selecting)
- [ ] Address textarea appears on Step 2
- [ ] Address is required (form shows error if empty)
- [ ] Form validation works correctly
- [ ] Data saves to Supabase correctly
- [ ] Admin panel can view both new fields in admission details
- [ ] Admin panel can update both new fields in admission details
- [ ] Build completes without errors

---

## Run the Migration

Execute the SQL queries in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the SQL from `supabase_migrations/add_blood_group_and_address.sql`
4. Click "Execute"
5. Verify the columns are created

Or use Supabase CLI:
```bash
supabase db push
```

---

## Notes

- Blood Group is optional - user can leave it blank
- Address is compulsory - form will not submit without it
- Both fields will be included in the CSV export from admin panel
- Admin can update both fields in the admission details modal
- Proper naming convention maintained: `child_blood_group`, `parent_address`

