-- Add email_confirmed_at column to customers table if it doesn't exist
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_email_confirmed ON public.customers(email_confirmed_at);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);

-- Update RLS policies for customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can update own customer data" ON public.customers;
DROP POLICY IF EXISTS "Service role can manage all customer data" ON public.customers;
DROP POLICY IF EXISTS "Users can insert own customer data" ON public.customers;

-- Create RLS policies
CREATE POLICY "Users can view own customer data" ON public.customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own customer data" ON public.customers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all customer data" ON public.customers
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to insert their own customer data
CREATE POLICY "Users can insert own customer data" ON public.customers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
