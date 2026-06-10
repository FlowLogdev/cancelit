-- ============================================
-- DISABLE EMAIL CONFIRMATION FOR TESTING
-- ============================================
-- This makes signup instant (no email verification needed)
-- ONLY USE FOR TESTING!

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE 'DISABLING EMAIL CONFIRMATION';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  WARNING: This is for TESTING ONLY!';
    RAISE NOTICE '';
    RAISE NOTICE 'To disable email confirmation:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Go to Supabase Dashboard';
    RAISE NOTICE '2. Click on "Authentication" in left sidebar';
    RAISE NOTICE '3. Go to "Providers" tab';
    RAISE NOTICE '4. Scroll to "Email" provider';
    RAISE NOTICE '5. Click "Edit"';
    RAISE NOTICE '6. UNCHECK "Enable email confirmations"';
    RAISE NOTICE '7. Click "Save"';
    RAISE NOTICE '';
    RAISE NOTICE 'This cannot be done via SQL - must use Dashboard UI.';
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════════';
END $$;
