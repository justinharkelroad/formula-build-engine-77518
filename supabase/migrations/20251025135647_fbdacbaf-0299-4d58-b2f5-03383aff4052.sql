-- Add first_name and last_name columns to waitlist table
ALTER TABLE public.waitlist 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Copy existing name data to first_name (temporary migration for existing data)
UPDATE public.waitlist 
SET first_name = SPLIT_PART(name, ' ', 1),
    last_name = SUBSTRING(name FROM POSITION(' ' IN name) + 1)
WHERE name IS NOT NULL;

-- Make the new columns required
ALTER TABLE public.waitlist 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Drop the old name column
ALTER TABLE public.waitlist 
DROP COLUMN name;