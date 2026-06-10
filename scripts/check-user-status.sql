-- ============================================
-- CHECK USER STATUS
-- ============================================
-- Check the status of a specific user

-- Replace with your email
DO $$
DECLARE
    user_exists boolean;
    user_record RECORD;
BEGIN
    -- Check if user exists
    SELECT 
        id,
        email,
        created_at,
        email_confirmed_at,
        confirmed_at,
        last_sign_in_at
    INTO user_record
    FROM auth.users
    WHERE email = 'sales@lustmia.com'
    LIMIT 1;

    user_exists := FOUND;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'USER STATUS CHECK';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';

    IF user_exists THEN
        RAISE NOTICE '✅ USER EXISTS';
        RAISE NOTICE '';
        RAISE NOTICE 'User ID: %', user_record.id;
        RAISE NOTICE 'Email: %', user_record.email;
        RAISE NOTICE 'Created: %', user_record.created_at;
        RAISE NOTICE 'Email Confirmed: %', COALESCE(user_record.email_confirmed_at::text, 'NOT CONFIRMED');
        RAISE NOTICE 'Confirmed: %', COALESCE(user_record.confirmed_at::text, 'NOT CONFIRMED');
        RAISE NOTICE 'Last Sign In: %', COALESCE(user_record.last_sign_in_at::text, 'NEVER');
        RAISE NOTICE '';
        
        IF user_record.email_confirmed_at IS NULL THEN
            RAISE NOTICE '⚠️  Status: UNCONFIRMED';
            RAISE NOTICE '';
            RAISE NOTICE 'To confirm this user, run:';
            RAISE NOTICE 'scripts/manually-confirm-user.sql';
        ELSE
            RAISE NOTICE '✅ Status: CONFIRMED';
            RAISE NOTICE '';
            RAISE NOTICE 'You can sign in at:';
            RAISE NOTICE 'https://www.cancelit.app/signin';
        END IF;
    ELSE
        RAISE NOTICE '❌ USER DOES NOT EXIST';
        RAISE NOTICE '';
        RAISE NOTICE 'Email: sales@lustmia.com';
        RAISE NOTICE '';
        RAISE NOTICE 'This user has not signed up yet.';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
