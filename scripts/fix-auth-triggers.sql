-- Drop existing triggers and functions to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_user_profile_updated ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_signup();
DROP FUNCTION IF EXISTS handle_email_confirmation();
DROP FUNCTION IF EXISTS sync_user_profile_updates();

-- Create a simplified function to handle new user signups
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into customers table when a new user signs up
  INSERT INTO public.customers (
    user_id,
    email,
    full_name,
    subscription_status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free',
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating customer record for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.customers TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
