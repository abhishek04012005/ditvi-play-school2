# Fix: Awards Table CHECK Constraint Error

## Problem
```
Failed to create spotlight: new row for relation "awards" violates check constraint "awards_award_type_check"
```

## Root Cause
The `awards` table has a CHECK constraint on the `award_type` column that only allows specific hardcoded values (like 'weekly', 'monthly', 'yearly'). Custom spotlight types are rejected because they don't match this constraint.

## Solution
Run the SQL migration to remove the restrictive CHECK constraint and allow any non-empty string value.

## Steps to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase_migrations/fix_awards_award_type_constraint.sql`
5. Run the query
6. Verify success - you should see no errors

### Option 2: Using Supabase CLI

```bash
supabase migration up
```

## What the Migration Does

1. **Drops the restrictive CHECK constraint**: Removes `awards_award_type_check` that limited values to specific enums
2. **Ensures TEXT data type**: Converts `award_type` column to TEXT if needed
3. **Adds permissive constraint**: Adds a new CHECK constraint that only validates non-empty strings

## After Applying the Fix

You can now:
- ✅ Create spotlights with custom spotlight types
- ✅ Create spotlights with default types (weekly, monthly, yearly)
- ✅ Any non-empty string value is accepted

## Verification

Test that it works:

1. Go to the Spotlight Dashboard
2. Click **Create Spotlight**
3. Try creating a spotlight with:
   - A default type (e.g., "⭐ Star of the Week")
   - A custom type (e.g., "🎓 Best Reader")
4. Both should now work without the CHECK constraint error

## Rollback (if needed)

If you need to revert this change:

```sql
ALTER TABLE public.awards 
DROP CONSTRAINT IF EXISTS awards_award_type_not_empty;

ALTER TABLE public.awards
ADD CONSTRAINT awards_award_type_check 
CHECK (award_type IN ('weekly', 'monthly', 'yearly'));
```

## Related Files

- Migration: `supabase_migrations/fix_awards_award_type_constraint.sql`
- Spotlight Component: `src/admin/spotlight/spotlight.tsx`
- Default Types: Lines 71-103 in spotlight.tsx
