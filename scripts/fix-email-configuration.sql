-- ============================================
-- FIX EMAIL CONFIGURATION
-- ============================================
-- This script checks and helps fix email-related issues

DO $$
DECLARE
    unconfirmed_count integer;
    total_users integer;
    user_record RECORD;
BEGIN
    -- Count users
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO unconfirmed_count FROM auth.users WHERE email_confirmed_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'EMAIL CONFIGURATION CHECK';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Total users: %', total_users;
    RAISE NOTICE 'Unconfirmed users: %', unconfirmed_count;
    RAISE NOTICE 'Confirmed users: %', total_users - unconfirmed_count;
    RAISE NOTICE '';
    
    IF unconfirmed_count > 0 THEN
        RAISE NOTICE '════════════════════════════════════════';
        RAISE NOTICE 'UNCONFIRMED USERS:';
        RAISE NOTICE '════════════════════════════════════════';
        RAISE NOTICE '';
        
        FOR user_record IN 
            SELECT id, email, created_at
            FROM auth.users
            WHERE email_confirmed_at IS NULL
            ORDER BY created_at DESC
        LOOP
            RAISE NOTICE '📧 %', user_record.email;
            RAISE NOTICE '   Created: %', user_record.created_at;
            RAISE NOTICE '';
        END LOOP;
        
        RAISE NOTICE '════════════════════════════════════════';
        RAISE NOTICE 'SOLUTIONS:';
        RAISE NOTICE '════════════════════════════════════════';
        RAISE NOTICE '';
        RAISE NOTICE 'Option 1: DISABLE EMAIL CONFIRMATION (Development)';
        RAISE NOTICE '-------------------------------------------------';
        RAISE NOTICE '1. Go to Supabase Dashboard';
        RAISE NOTICE '2. Authentication → Providers → Email';
        RAISE NOTICE '3. Edit the Email provider';
        RAISE NOTICE '4. UNCHECK "Enable email confirmations"';
        RAISE NOTICE '5. Save';
        RAISE NOTICE '';
        RAISE NOTICE 'Option 2: MANUALLY CONFIRM USERS (Testing)';
        RAISE NOTICE '-------------------------------------------------';
        RAISE NOTICE '1. Edit scripts/manually-confirm-user.sql';
        RAISE NOTICE '2. Replace the email with your email';
        RAISE NOTICE '3. Run the script in Supabase SQL Editor';
        RAISE NOTICE '';
        RAISE NOTICE 'Option 3: CONFIGURE CUSTOM SMTP (Production)';
        RAISE NOTICE '-------------------------------------------------';
        RAISE NOTICE '1. Go to Supabase Dashboard';
        RAISE NOTICE '2. Project Settings → Auth';
        RAISE NOTICE '3. Scroll to SMTP Settings';
        RAISE NOTICE '4. Configure with Gmail, SendGrid, etc.';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '✅ All users are confirmed!';
        RAISE NOTICE '';
    END IF;
    
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- Show detailed user information
SELECT 
    email,
    created_at,
    CASE 
        WHEN email_confirmed_at IS NULL THEN '❌ Unconfirmed'
        ELSE '✅ Confirmed'
    END as status,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
