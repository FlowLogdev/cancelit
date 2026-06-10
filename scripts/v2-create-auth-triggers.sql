-- ─────────────────────────────────────────────────────────────
--  v2-create-auth-triggers.sql
--  Synchronises auth.users <-> public.customers
-- ─────────────────────────────────────────────────────────────

/* ------------------------------------------------------------------
   Cleanup old triggers / functions (safe-to-exist).
------------------------------------------------------------------ */
DROP TRIGGER  IF EXISTS on_auth_user_created     ON auth.users;
DROP TRIGGER  IF EXISTS on_email_confirmed       ON auth.users;
DROP TRIGGER  IF EXISTS on_user_profile_updated  ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.handle_email_confirmation();
DROP FUNCTION IF EXISTS public.sync_user_profile_updates();
DROP FUNCTION IF EXISTS public.handle_new_user();

/* ------------------------------------------------------------------
   1️⃣  Insert customer row immediately after a new auth user appears
------------------------------------------------------------------ */
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.customers (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Failed to create customer record: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/* ------------------------------------------------------------------
   2️⃣  Copy email_confirmed_at timestamp when the user confirms email
------------------------------------------------------------------ */
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.customers
       SET email_confirmed_at = NEW.email_confirmed_at,
           updated_at         = now()
     WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

/* ------------------------------------------------------------------
   3️⃣  Keep profile fields in sync when auth.users updates
------------------------------------------------------------------ */
CREATE OR REPLACE FUNCTION public.sync_user_profile_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.customers
     SET email      = NEW.email,
         full_name  = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
         avatar_url = NEW.raw_user_meta_data->>'avatar_url',
         updated_at = now()
   WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

/* ------------------------------------------------------------------
   4️⃣  Attach triggers to auth.users
------------------------------------------------------------------ */
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_email_confirmed
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmation();

CREATE TRIGGER on_user_profile_updated
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile_updates();

/* ------------------------------------------------------------------
   5️⃣  Allow Postgres service roles to execute functions
------------------------------------------------------------------ */
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup       TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.handle_email_confirmation    TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.sync_user_profile_updates    TO postgres, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user()            TO service_role;
