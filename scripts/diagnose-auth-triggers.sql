-- ============================================
-- COMPREHENSIVE AUTH DIAGNOSTICS
-- ============================================
-- This script performs a complete diagnostic of your auth setup

-- 1. Check all triggers on auth.users
DO $$
DECLARE
    trigger_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '1. TRIGGERS ON auth.users';
    RAISE NOTICE '════════════════════════════════════════';
    
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth'
    AND event_object_table = 'users';
    
    IF trigger_count = 0 THEN
        RAISE NOTICE '⚠️  NO TRIGGERS FOUND';
        RAISE NOTICE '';
        RAISE NOTICE 'This means customer records will NOT be created';
        RAISE NOTICE 'automatically when users sign up.';
    ELSE
        RAISE NOTICE '✅ Found % trigger(s)', trigger_count;
    END IF;
    
    RAISE NOTICE '';
END $$;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. Check functions
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '2. AUTH-RELATED FUNCTIONS';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
    routine_name LIKE '%user%' 
    OR routine_name LIKE '%auth%'
    OR routine_name LIKE '%customer%'
    OR routine_name LIKE '%signup%'
)
ORDER BY routine_name;

-- 3. Check customers table
DO $$
DECLARE
    table_exists boolean;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '3. CUSTOMERS TABLE';
    RAISE NOTICE '════════════════════════════════════════';
    
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ customers table exists';
    ELSE
        RAISE NOTICE '❌ customers table DOES NOT exist';
    END IF;
    
    RAISE NOTICE '';
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'customers'
ORDER BY ordinal_position;

-- 4. Check user and customer counts
DO $$
DECLARE
    user_count integer;
    customer_count integer;
    confirmed_count integer;
    unconfirmed_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    SELECT COUNT(*) INTO customer_count FROM customers;
    SELECT COUNT(*) INTO confirmed_count FROM auth.users WHERE email_confirmed_at IS NOT NULL;
    SELECT COUNT(*) INTO unconfirmed_count FROM auth.users WHERE email_confirmed_at IS NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '4. USER STATISTICS';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Total auth.users: %', user_count;
    RAISE NOTICE 'Confirmed users: %', confirmed_count;
    RAISE NOTICE 'Unconfirmed users: %', unconfirmed_count;
    RAISE NOTICE 'Total customers: %', customer_count;
    RAISE NOTICE '';
    
    IF user_count > customer_count THEN
        RAISE NOTICE '⚠️  More users than customers!';
        RAISE NOTICE 'Missing % customer record(s)', user_count - customer_count;
    ELSIF customer_count > user_count THEN
        RAISE NOTICE '⚠️  More customers than users!';
        RAISE NOTICE 'Orphaned % customer record(s)', customer_count - user_count;
    ELSE
        RAISE NOTICE '✅ User and customer counts match';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- 5. Show recent users and customers
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '5. RECENT RECORDS';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

SELECT 
    'auth.users' as table_name,
    u.email,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
        ELSE '❌ Unconfirmed'
    END as status,
    u.created_at
FROM auth.users u
ORDER BY u.created_at DESC
LIMIT 5;

SELECT 
    'customers' as table_name,
    c.email,
    c.subscription_status as status,
    c.created_at
FROM customers c
ORDER BY c.created_at DESC
LIMIT 5;

-- 6. Final summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'DIAGNOSTIC COMPLETE';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check if there are unconfirmed users';
    RAISE NOTICE '2. Run scripts/manually-confirm-user.sql';
    RAISE NOTICE '3. Or disable email confirmation in Dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
