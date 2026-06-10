-- Drop all existing triggers and functions on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop and recreate the customers table to ensure clean state
DROP TABLE IF EXISTS public.customers CASCADE;

-- Create customers table with proper structure
CREATE TABLE public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT,
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'basic', 'pro', 'enterprise')),
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
CREATE POLICY "Users can view own customer data" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own customer data" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to insert/update/delete
CREATE POLICY "Service role can manage all customer data" ON public.customers
    FOR ALL USING (auth.role() = 'service_role');

-- Create a safe trigger function that won't fail auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to insert customer record, but don't fail if it doesn't work
    BEGIN
        INSERT INTO public.customers (user_id, email, full_name)
        VALUES (
            NEW.id,
            COALESCE(NEW.email, ''),
            COALESCE(NEW.raw_user_meta_data->>'full_name', '')
        );
        
        -- Log success
        RAISE LOG 'Customer record created for user %', NEW.id;
        
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the auth signup
        RAISE LOG 'Failed to create customer record for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

-- Ensure the trigger function can be executed
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS customers_user_id_idx ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS customers_email_idx ON public.customers(email);
