-- ============================================================================
-- Fix "Database error saving new user" by creating a fail-safe trigger
-- ============================================================================

-- 1. Clean up any existing problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Ensure customers table exists with proper structure
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS and create policies
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_select_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_update_policy" ON public.customers;

CREATE POLICY "customers_select_policy"
  ON public.customers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "customers_update_policy"
  ON public.customers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Grant necessary permissions
GRANT ALL ON public.customers TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. Create fail-safe trigger function that never throws errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Try to insert customer record, but never let it fail the auth signup
  BEGIN
    INSERT INTO public.customers (user_id, email, full_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't re-raise it
    RAISE WARNING 'Failed to create customer record for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- 6. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Add comment for documentation
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
'Creates customer record after user signup. Uses exception handling to prevent signup failures.';
