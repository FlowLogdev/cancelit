-- ============================================
-- Debug Script for Signup Issues
-- ============================================
-- Run this entire script in Supabase SQL Editor to diagnose signup problems

-- 1. Check if customers table exists and has correct structure
SELECT '=== 1. CUSTOMERS TABLE STRUCTURE ===' as section;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'customers'
ORDER BY ordinal_position;

-- 2. Check for constraints on customers table
SELECT '=== 2. CUSTOMERS TABLE CONSTRAINTS ===' as section;

SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'customers'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. List all triggers on auth.users
SELECT '=== 3. TRIGGERS ON AUTH.USERS ===' as section;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
ORDER BY trigger_name;

-- 4. Get the actual trigger function source code
SELECT '=== 4. TRIGGER FUNCTIONS SOURCE CODE ===' as section;

SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname IN ('handle_new_user_signup', 'handle_new_user', 'handle_user_signup')
    AND n.nspname = 'public'
ORDER BY p.proname;

-- 5. Check recent auth.users entries
SELECT '=== 5. RECENT AUTH USERS (LAST 10) ===' as section;

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    raw_user_meta_data->>'full_name' as full_name,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED'
        ELSE 'PENDING'
    END as status
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 6. Check corresponding customers entries
SELECT '=== 6. RECENT CUSTOMERS (LAST 10) ===' as section;

SELECT 
    c.id as customer_id,
    c.user_id,
    c.email,
    c.full_name,
    c.subscription_status,
    c.created_at,
    u.email as auth_email,
    CASE 
        WHEN u.id IS NULL THEN 'ORPHANED (NO AUTH USER)'
        ELSE 'LINKED'
    END as link_status
FROM customers c
LEFT JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC
LIMIT 10;

-- 7. Find orphaned auth users (users without customer records)
SELECT '=== 7. ORPHANED AUTH USERS (NO CUSTOMER RECORD) ===' as section;

SELECT 
    u.id as user_id,
    u.email,
    u.created_at as user_created,
    u.email_confirmed_at,
    CASE WHEN c.id IS NULL THEN '❌ NO CUSTOMER RECORD' ELSE '✅ HAS CUSTOMER' END as status
FROM auth.users u
LEFT JOIN customers c ON u.id = c.user_id
WHERE c.id IS NULL
ORDER BY u.created_at DESC
LIMIT 10;

-- 8. Check RLS policies on customers table
SELECT '=== 8. ROW LEVEL SECURITY POLICIES ===' as section;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual as using_expression,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'customers'
ORDER BY policyname;

-- 9. Test if trigger function can be called manually
SELECT '=== 9. TESTING TRIGGER FUNCTION MANUALLY ===' as section;

-- This will show if the function exists and is callable
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name LIKE '%user%signup%'
ORDER BY routine_name;

-- 10. Check for any recent PostgreSQL errors
SELECT '=== 10. SUMMARY & RECOMMENDATIONS ===' as section;

SELECT 
    'Total Users' as metric,
    COUNT(*)::text as value
FROM auth.users
UNION ALL
SELECT 
    'Total Customers',
    COUNT(*)::text
FROM customers
UNION ALL
SELECT 
    'Users Without Customers',
    COUNT(*)::text
FROM auth.users u
LEFT JOIN customers c ON u.id = c.user_id
WHERE c.id IS NULL
UNION ALL
SELECT 
    'Active Triggers on auth.users',
    COUNT(DISTINCT trigger_name)::text
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
    AND event_object_table = 'users';

-- Instructions for next steps based on results
SELECT '
NEXT STEPS:
-----------
1. Review section 7 - If you see orphaned users, the trigger is not working
2. Check section 4 - Verify the trigger function source code looks correct  
3. Review section 3 - Ensure trigger exists and is AFTER INSERT
4. Check section 8 - Verify RLS policies allow inserts for service_role
5. If issues persist, run the fix script: scripts/fix-signup-database-error.sql
' as instructions;
