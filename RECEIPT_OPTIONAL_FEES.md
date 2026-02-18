# Receipt Management - Optional Fees Feature

## Overview

The Receipt Management system now includes optional fees that can be added to receipts:
- **Registration Fee** (₹)
- **Admission Fee** (₹)
- **Uniform Fee** (₹)

These fees are completely optional and can be included or excluded when creating a receipt.

## How to Use

### Creating a Receipt

1. **Go to Receipt Management Dashboard**
   - Navigate to Admin Panel → Receipt Dashboard

2. **Create New Receipt**
   - Click "Create Receipt" button
   - Or search for a student by admission number and click "Add Receipt"

3. **Fill Main Details**
   - Student Name (required)
   - Parent Name
   - Program
   - Fees Amount (₹) - Main fee amount (required)
   - Payment Mode (Cash, Cheque, Online, Other)
   - Payment Date
   - Month & Year

4. **Add Optional Fees** (NEW)
   - **Registration Fee**: Check the checkbox to enable, then enter amount
   - **Admission Fee**: Check the checkbox to enable, then enter amount
   - **Uniform Fee**: Check the checkbox to enable, then enter amount
   - These fields only show when you check the checkbox
   - Leave unchecked if not applicable

5. **Save Receipt**
   - Click "Create Receipt"
   - Receipt is saved with all selected fees

### Receipt Display

When you print or view a receipt:
- Shows all enabled fees with amounts
- Automatically calculates total including optional fees
- Only displays fees that were marked as included

## Database Fields

The `fee_receipts` table now includes:
```
registration_fee (DECIMAL)
include_registration_fee (BOOLEAN)
admission_fee (DECIMAL)
include_admission_fee (BOOLEAN)
uniform_fee (DECIMAL)
include_uniform_fee (BOOLEAN)
```

## Managing Program Fees

To set default fees for programs:
1. Go to **Fees Management** section
2. Create or edit a program
3. Set the fee amounts (Monthly, Annual, Registration, Admission, Uniform)
4. These become available for quick selection when creating receipts

## Features

✅ Optional checkboxes for each fee type
✅ Fees only appear in input if checkbox is checked
✅ Automatic calculation of total with all fees
✅ Receipt printing includes all selected fees
✅ Payment history shows complete fee breakdown
✅ Database stores which fees were included for auditing

## Example

**Scenario**: Creating a receipt for a student with registration + admission fees

1. Fees Amount: ₹6000 (Monthly fee)
2. Check "Registration Fee" → Enter 2000
3. Check "Admission Fee" → Enter 1000
4. Leave "Uniform Fee" unchecked
5. **Total**: ₹9000 (6000 + 2000 + 1000)

When printed, receipt shows:
- Monthly Fees: ₹6000
- Registration Fee: ₹2000
- Admission Fee: ₹1000
- **Total: ₹9000**
