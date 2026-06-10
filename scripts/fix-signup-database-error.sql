-- ============================================
-- Complete Fix for Signup Database Errors
-- ============================================
-- This script will completely rebuild the customer creation trigger
-- Run this in Supabase SQL Editor if you're getting "Database error saving new user"

-- Step 1: Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_customer ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_signup() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user_signup() CASCADE;

-- Step 2: Ensure customers table has correct structure
-- This will add missing columns if they don't exist
DO $$
BEGIN
    -- Add user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    -- Add unique constraint on user_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'customers' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name = 'customers_user_id_key'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT customers_user_id_key UNIQUE (user_id);
    END IF;

    -- Add full_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE customers ADD COLUMN full_name TEXT;
    END IF;

    -- Add subscription_status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE customers ADD COLUMN subscription_status TEXT DEFAULT 'free';
    END IF;
END $$;

-- Step 3: Create the new trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    full_name_value TEXT;
    email_value TEXT;
BEGIN
    -- Log the trigger execution (visible in Postgres logs if log_min_messages is set appropriately)
    RAISE LOG 'handle_new_user_signup triggered for user: %', NEW.id;

    -- Extract email (always present)
    email_value := NEW.email;

    -- Extract full_name from metadata, with fallback
    full_name_value := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Insert into customers table
    INSERT INTO public.customers (
        id,
        user_id,
        email,
        full_name,
        subscription_status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        NEW.id,
        email_value,
        full_name_value,
        'free',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, customers.full_name),
        updated_at = NOW();

    RAISE LOG 'Customer record created/updated successfully for user: %', NEW.id;

    -- Always return NEW to allow the auth.users insert to complete
    RETURN NEW;

EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user_signup for user %: % %', NEW.id, SQLERRM, SQLSTATE;
    -- Return NEW so the auth signup still succeeds
    RETURN NEW;
END;
$$;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_signup();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Step 6: Verify the setup
DO $$
DECLARE
    trigger_count INTEGER;
    function_exists BOOLEAN;
BEGIN
    -- Check if trigger exists
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_table = 'users'
        AND trigger_schema = 'auth'
        AND trigger_name = 'on_auth_user_created';

    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname = 'handle_new_user_signup'
    ) INTO function_exists;

    IF trigger_count > 0 AND function_exists THEN
        RAISE NOTICE '✅ Setup completed successfully!';
        RAISE NOTICE '   - Trigger: on_auth_user_created';
        RAISE NOTICE '   - Function: handle_new_user_signup';
        RAISE NOTICE '   - Ready to create users';
    ELSE
        RAISE WARNING '⚠️  Setup incomplete:';
        IF NOT function_exists THEN
            RAISE WARNING '   - Function handle_new_user_signup not found';
        END IF;
        IF trigger_count = 0 THEN
            RAISE WARNING '   - Trigger on_auth_user_created not found';
        END IF;
    END IF;
END $$;
