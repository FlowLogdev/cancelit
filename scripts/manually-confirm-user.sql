-- ============================================
-- MANUALLY CONFIRM USER FOR TESTING
-- ============================================
-- Use this to bypass email confirmation during development
-- Note: confirmed_at is a generated column, so we update email_confirmed_at instead

-- Replace 'sales@lustmia.com' with the email you just signed up with
UPDATE auth.users
SET 
    email_confirmed_at = NOW(),
    last_sign_in_at = NOW()
WHERE email = 'sales@lustmia.com'
AND email_confirmed_at IS NULL
RETURNING id, email, email_confirmed_at, confirmed_at;

-- Verify the user is now confirmed
DO $$
DECLARE
    user_record RECORD;
    found_user boolean := false;
BEGIN
    -- Find the confirmed user
    SELECT 
        id,
        email,
        email_confirmed_at,
        confirmed_at
    INTO user_record
    FROM auth.users
    WHERE email = 'sales@lustmia.com'
    AND email_confirmed_at IS NOT NULL
    LIMIT 1;

    found_user := FOUND;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    
    IF found_user THEN
        RAISE NOTICE '✅ USER SUCCESSFULLY CONFIRMED!';
        RAISE NOTICE '════════════════════════════════════════';
        RAISE NOTICE 'User ID: %', user_record.id;
        RAISE NOTICE 'Email: %', user_record.email;
        RAISE NOTICE 'Confirmed at: %', user_record.email_confirmed_at;
        RAISE NOTICE '';
        RAISE NOTICE '🎉 You can now sign in at:';
        RAISE NOTICE 'https://www.cancelit.app/signin';
        RAISE NOTICE '';
        RAISE NOTICE 'Use these credentials:';
        RAISE NOTICE 'Email: sales@lustmia.com';
        RAISE NOTICE 'Password: [your password]';
    ELSE
        RAISE NOTICE '❌ USER NOT FOUND OR ALREADY CONFIRMED';
        RAISE NOTICE '════════════════════════════════════════';
        RAISE NOTICE 'Email: sales@lustmia.com';
        RAISE NOTICE '';
        RAISE NOTICE 'This could mean:';
        RAISE NOTICE '1. The user does not exist';
        RAISE NOTICE '2. The user was already confirmed';
        RAISE NOTICE '3. The email is incorrect';
    END IF;
    
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
