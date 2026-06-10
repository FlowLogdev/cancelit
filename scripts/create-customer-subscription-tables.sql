-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- Create customers table
CREATE TABLE public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT customers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    subscription_phone TEXT,
    account_number TEXT,
    monthly_cost DECIMAL(10,2) NOT NULL CHECK (monthly_cost >= 0),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    next_billing_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    category TEXT DEFAULT 'other',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_billing_cycle ON public.subscriptions(billing_cycle);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can insert their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;

DROP POLICY IF EXISTS "Users can view subscriptions for their customers" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert subscriptions for their customers" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update subscriptions for their customers" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete subscriptions for their customers" ON public.subscriptions;

-- Create RLS policies for customers table
CREATE POLICY "Users can view their own customers" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON public.customers
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for subscriptions table
CREATE POLICY "Users can view subscriptions for their customers" ON public.subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.customers 
            WHERE customers.id = subscriptions.customer_id 
            AND customers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert subscriptions for their customers" ON public.subscriptions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.customers 
            WHERE customers.id = subscriptions.customer_id 
            AND customers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update subscriptions for their customers" ON public.subscriptions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.customers 
            WHERE customers.id = subscriptions.customer_id 
            AND customers.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete subscriptions for their customers" ON public.subscriptions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.customers 
            WHERE customers.id = subscriptions.customer_id 
            AND customers.user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - you can remove this section if not needed)
-- Note: This will only work if you have a user authenticated
DO $$
DECLARE
    sample_customer_id UUID;
BEGIN
    -- Only insert sample data if auth.uid() is available (user is authenticated)
    IF auth.uid() IS NOT NULL THEN
        -- Insert sample customer
        INSERT INTO public.customers (user_id, first_name, last_name, email, phone_number)
        VALUES (auth.uid(), 'John', 'Doe', 'john.doe@example.com', '+1-555-123-4567')
        RETURNING id INTO sample_customer_id;

        -- Insert sample subscriptions
        INSERT INTO public.subscriptions (customer_id, company_name, monthly_cost, billing_cycle, status, category, notes)
        VALUES 
            (sample_customer_id, 'Netflix', 15.99, 'monthly', 'active', 'entertainment', 'Streaming service'),
            (sample_customer_id, 'Spotify', 9.99, 'monthly', 'active', 'music', 'Music streaming'),
            (sample_customer_id, 'Adobe Creative Cloud', 52.99, 'monthly', 'active', 'software', 'Design software suite');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors in sample data insertion
        NULL;
END $$;
