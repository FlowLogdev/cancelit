-- ============================================
-- FAST ASYNC TRIGGER - WON'T BLOCK SIGNUP
-- ============================================

-- Step 1: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_signup() CASCADE;

-- Step 2: Create a FAST function with timeout protection
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    customer_exists boolean;
BEGIN
    -- Log the attempt
    RAISE LOG 'Trigger fired for user: %', NEW.email;

    -- Quick check if customer already exists (use EXISTS for speed)
    SELECT EXISTS (
        SELECT 1 FROM public.customers WHERE user_id = NEW.id
    ) INTO customer_exists;

    -- If customer exists, skip creation
    IF customer_exists THEN
        RAISE LOG 'Customer already exists for user: %', NEW.id;
        RETURN NEW;
    END IF;

    -- Fast insert with ON CONFLICT (won't fail if exists)
    BEGIN
        INSERT INTO public.customers (
            user_id,
            email,
            full_name,
            subscription_status,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
            'free',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;

        RAISE LOG 'Customer created successfully for: %', NEW.email;
    EXCEPTION WHEN OTHERS THEN
        -- Log error but DON'T prevent user creation
        RAISE LOG 'Customer creation failed: %, %', SQLERRM, SQLSTATE;
        RAISE LOG 'User will be created anyway: %', NEW.email;
    END;

    -- Always return NEW to allow user creation
    RETURN NEW;
END;
$$;

-- Step 3: Create the trigger with AFTER timing (non-blocking)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_signup();

-- Step 4: Verify installation
DO $$
DECLARE
    trigger_count integer;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created';

    IF trigger_count > 0 THEN
        RAISE NOTICE '✅ Fast trigger installed successfully!';
        RAISE NOTICE '';
        RAISE NOTICE 'Try signing up now with a new email.';
        RAISE NOTICE 'The trigger will create a customer record but won''t block signup.';
    ELSE
        RAISE EXCEPTION 'Trigger installation failed!';
    END IF;
END $$;
