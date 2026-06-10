-- ============================================
-- DROP TRIGGER FOR TESTING
-- ============================================
-- We can drop our own trigger even if we don't own the table

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Verify it's gone
DO $$
DECLARE
    trigger_count integer;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
    AND trigger_name = 'on_auth_user_created';

    IF trigger_count = 0 THEN
        RAISE NOTICE '✅ Trigger successfully removed';
        RAISE NOTICE '';
        RAISE NOTICE 'Now try signing up with a new email.';
        RAISE NOTICE 'If it works, the trigger was causing the timeout.';
    ELSE
        RAISE EXCEPTION 'Failed to remove trigger!';
    END IF;
END $$;
