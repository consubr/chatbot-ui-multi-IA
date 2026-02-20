-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('FREE', 'PAID', 'ADMIN', 'SUPER_ADMIN', 'PLAN1', 'PLAN2', 'PLAN3');

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role NOT NULL DEFAULT 'FREE';

-- Add check constraint to ensure role is valid (redundant with enum but good for documentation/completeness in some contexts, though postgres enums enforce this automatically)
-- We don't strictly need a CHECK constraint with an ENUM, but if we wanted one for string types:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('FREE', 'PAID', 'ADMIN', 'SUPER_ADMIN', 'PLAN1', 'PLAN2', 'PLAN3'));
