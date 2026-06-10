-- Verify that the trigger and function are installed correctly
-- Run this after executing the fix script

-- Check if the trigger exists
SELECT 
    'Trigger Status' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ INSTALLED'
        ELSE '❌ NOT FOUND'
    END as status,
    COUNT(*)::text as count
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created'

UNION ALL

-- Check if the function exists
SELECT 
    'Function Status' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ INSTALLED'
        ELSE '❌ NOT FOUND'
    END as status,
    COUNT(*)::text as count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname = 'handle_new_user_signup';

-- Show the trigger details
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created';
