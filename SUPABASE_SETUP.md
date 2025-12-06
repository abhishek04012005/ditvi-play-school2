# Supabase Migration Guide

## Setting up the Spotlight Types Table

The spotlight system requires a `spotlight_types` table in your Supabase database to store custom award types.

### Option 1: Using the SQL Editor (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the SQL from `supabase_migrations/create_spotlight_types_table.sql`
5. Paste it into the query editor
6. Click **Run**

### Option 2: Using the File

1. Go to **Migrations** section in Supabase dashboard
2. Create a new migration
3. Copy and paste the contents of `supabase_migrations/create_spotlight_types_table.sql`
4. Run the migration

## What This Table Does

The `spotlight_types` table stores custom award types with the following columns:

- **id** (UUID): Unique identifier
- **name** (TEXT): Type name (e.g., "Best Reader", "Star of the Week")
- **emoji** (TEXT): Emoji icon for the type
- **color** (TEXT): Hex color code for the type badge
- **description** (TEXT): Optional description
- **created_date** (TIMESTAMP): When the type was created
- **updated_date** (TIMESTAMP): When the type was last updated

## Default Types

The system includes these built-in types (no database required):
- ⭐ **Weekly** - Star of the Week
- ✨ **Monthly** - Star of the Month
- 🏆 **Yearly** - Star of the Year

Custom types are stored in the database and can be added/deleted by admins.

## Troubleshooting

### Error: "Could not find the table 'public.spotlight_types'"

This means the table hasn't been created yet. Follow the setup steps above.

### Error: "Database error: new row violates row level security (RLS) policy"

The RLS policies might not be set correctly. Run the migration SQL again to ensure policies are properly configured.

### The table is created but still not working?

1. Check that Row Level Security (RLS) is enabled
2. Verify the policies are set correctly
3. Check your Supabase connection string in `.env.local`

## Testing the Connection

After creating the table, you can test it by:

1. Going to the Spotlight admin dashboard
2. Clicking the **⚙️ Types** button
3. Try creating a new custom type
4. You should see a success message if the connection works
