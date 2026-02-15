# Registration Fees in Receipts - Quick Reference

## 🎯 What's New

**Checkbox to include registration fee in receipts** - admins can now add registration fee along with monthly/annual fees.

---

## 📋 Quick Setup

### 1. Database Migration
Run this SQL in Supabase:
```sql
ALTER TABLE public.fee_receipts 
ADD COLUMN IF NOT EXISTS registration_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS include_registration_fee boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_fee_receipts_include_registration_fee 
ON public.fee_receipts(include_registration_fee);
```

**File**: `db/add_registration_fees_to_receipts.sql`

### 2. Code Changes
Already implemented in:
- `src/admin/dashboard/receipt/receipt.tsx`

### 3. Deploy
No additional dependencies - uses existing Supabase setup.

---

## 💡 How to Use

### Create Receipt with Registration Fee

```
1. Go to: /admin/dashboard/receipt
2. Click "Create Receipt" button
3. Fill in student/admission details
4. Select Program → Registration fee auto-fills
5. Enter Monthly/Annual fees amount
6. **Check "Include Registration Fee: ₹ 2,000"** ← NEW
7. Click Submit
```

### Result

Receipt shows:
```
Monthly Fees        January 2026    ₹ 6,000.00
Registration Fee         -          ₹ 2,000.00
─────────────────────────────────────────────
Total Amount                        ₹ 8,000.00
```

---

## 🔧 Form Fields

| Field | Type | Auto-fill | Required | Notes |
|-------|------|-----------|----------|-------|
| Student Name | Text | Yes (from admission) | Yes | |
| Program | Dropdown | No | Yes | |
| Monthly Fee | Amount | No | Yes | |
| **Registration Fee Checkbox** | ✓/✗ | No | No | **NEW** |
| Payment Mode | Dropdown | No | Yes | |
| Payment Date | Date | Today | Yes | |

---

## 📊 Database Fields

### New Columns Added

```sql
registration_fee        numeric DEFAULT 0
include_registration_fee boolean DEFAULT false
```

### Example Data

**With Registration:**
```
fees_amount = 6000.00
registration_fee = 2000.00
include_registration_fee = true
Total = 8000.00
```

**Without Registration:**
```
fees_amount = 7000.00
registration_fee = 0
include_registration_fee = false
Total = 7000.00
```

---

## 📋 SQL Queries

### Get Receipts with Registration Fees
```sql
SELECT receipt_number, student_name, fees_amount, registration_fee, 
       (fees_amount + registration_fee) as total
FROM public.fee_receipts
WHERE include_registration_fee = true
ORDER BY payment_date DESC;
```

### Total Revenue with Registration
```sql
SELECT 
    SUM(fees_amount) as fees_total,
    SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as registration_total,
    SUM(fees_amount) + SUM(CASE WHEN include_registration_fee THEN registration_fee ELSE 0 END) as grand_total
FROM public.fee_receipts
WHERE status = 'paid';
```

### Registration Fee by Program
```sql
SELECT program, COUNT(*) as count, 
       SUM(registration_fee) as collected
FROM public.fee_receipts
WHERE include_registration_fee = true
GROUP BY program;
```

---

## 🎨 Form Checkbox UI

```tsx
<input
    type="checkbox"
    id="include_registration_fee"
    checked={formData.include_registration_fee}
    onChange={(e) => setFormData({ ...formData, include_registration_fee: e.target.checked })}
    disabled={createLoading || !formData.program}
/>
<label>
    Include Registration Fee: <strong>₹ {formData.registration_fee.toLocaleString()}</strong>
</label>
```

**Behavior:**
- Disabled if program not selected
- Shows amount in label
- Unchecked by default
- User chooses whether to include

---

## 📑 Receipt Template

### Display Logic
```tsx
<tbody>
    <tr>
        <td>Monthly Fees</td>
        <td>{month} {year}</td>
        <td>₹ {fees_amount}</td>
    </tr>
    {include_registration_fee && registration_fee ? (
        <tr>
            <td>Registration Fee</td>
            <td>-</td>
            <td>₹ {registration_fee}</td>
        </tr>
    ) : null}
</tbody>
```

**Shows:**
- Monthly fees row (always)
- Registration row (only if checked)
- Total (sums both if applicable)

---

## 🔄 Program Fee Data

Registration fees already configured:
```
Play Group:        ₹ 2,000
Nursery:          ₹ 2,500
Junior KG:        ₹ 3,000
Senior KG:        ₹ 3,500
```

Auto-fills when program selected.

---

## ✅ Checklist

- [x] Database columns added
- [x] Form checkbox implemented
- [x] Receipt template updated
- [x] Print template shows registration fee
- [x] Database migration script created
- [x] TypeScript types updated
- [x] Build passes (0 errors)
- [x] Backward compatible

---

## 📊 Examples

### Example 1: Play Group, First Month
```
Program: Play Group
Monthly Fee: ₹ 6,000
Registration Fee: ₹ 2,000 (checked)
─────────────────────────
Total: ₹ 8,000
```

### Example 2: Nursery, Subsequent Month
```
Program: Nursery
Monthly Fee: ₹ 7,000
Registration Fee: ₹ 2,500 (unchecked)
─────────────────────────
Total: ₹ 7,000
```

### Example 3: Annual Payment
```
Program: Junior KG
Annual Fee: ₹ 96,000
Registration Fee: ₹ 3,000 (checked)
─────────────────────────
Total: ₹ 99,000
```

---

## 🎯 Use Cases

| Scenario | Include? | Why |
|----------|----------|-----|
| First receipt for new student | Yes | Must collect registration |
| Student already paid registration | No | Only collecting monthly |
| Mid-year enrollment | Yes | First month includes registration |
| Annual payment with registration | Yes | Bundle both |
| Monthly payment only | No | Registration paid separately |

---

## 🚀 Deployment

1. Run SQL migration in Supabase
2. Code already deployed
3. No environment changes needed
4. Works immediately

---

## 📞 Support

**Files:**
- Migration: `db/add_registration_fees_to_receipts.sql`
- Code: `src/admin/dashboard/receipt/receipt.tsx`
- Docs: `REGISTRATION_FEES_RECEIPTS.md`

**Questions?** Check the main documentation file.

---

## ✨ Benefits

✅ Flexible - include registration only when needed
✅ Automated - auto-fills from program data
✅ Clear - itemized breakdown on receipt
✅ Trackable - database records who paid registration
✅ Professional - clean receipt template
✅ Backward compatible - existing receipts unaffected

---

*Status: ✅ Ready to Use*
*Build: ✓ No Errors*
