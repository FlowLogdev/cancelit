-- ============================================
-- TEMPORARILY DISABLE TRIGGER FOR TESTING
-- ============================================
-- This will let us test if signup works WITHOUT the trigger

-- Step 1: Disable the trigger (don't delete it)
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Verify it's disabled
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    status_
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- Use DO block for RAISE NOTICE
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger disabled for testing';
    RAISE NOTICE '';
    RAISE NOTICE 'Now try signing up with a new email.';
    RAISE NOTICE 'If it works, the trigger was causing the timeout.';
END $$;
