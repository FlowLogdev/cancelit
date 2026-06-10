-- =====================================================
-- CancelIt Database Setup Script
-- Complete database schema for subscription management
-- =====================================================

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS cancellation_requests CASCADE;
DROP TABLE IF EXISTS subscription_alerts CASCADE;
DROP TABLE IF EXISTS detected_subscriptions CASCADE;
DROP TABLE IF EXISTS plaid_transactions CASCADE;
DROP TABLE IF EXISTS plaid_accounts CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS calculate_monthly_spending(UUID) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- 1. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
  plan_price DECIMAL(10,2) DEFAULT 0.00,
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own customer data"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

CREATE INDEX idx_customers_email ON customers(email);

-- =====================================================
-- 2. SUBSCRIPTION CATEGORIES TABLE
-- =====================================================
CREATE TABLE subscription_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON subscription_categories FOR SELECT
  USING (true);

INSERT INTO subscription_categories (name, icon, color) VALUES
  ('Streaming', 'tv', 'bg-purple-500'),
  ('Music', 'music', 'bg-pink-500'),
  ('Software', 'code', 'bg-blue-500'),
  ('Cloud Storage', 'cloud', 'bg-cyan-500'),
  ('Gaming', 'gamepad-2', 'bg-green-500'),
  ('Fitness', 'dumbbell', 'bg-orange-500'),
  ('News', 'newspaper', 'bg-red-500'),
  ('Education', 'book-open', 'bg-yellow-500'),
  ('Productivity', 'briefcase', 'bg-indigo-500'),
  ('Security', 'shield', 'bg-gray-500'),
  ('Communication', 'message-circle', 'bg-teal-500'),
  ('Finance', 'dollar-sign', 'bg-emerald-500'),
  ('Food & Delivery', 'utensils', 'bg-amber-500'),
  ('Other', 'more-horizontal', 'bg-slate-500');

-- =====================================================
-- 3. SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  category_id UUID REFERENCES subscription_categories(id),
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_billing_date DATE NOT NULL,
  last_billing_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'pending_cancellation')),
  auto_renew BOOLEAN DEFAULT true,
  cancellation_difficulty TEXT CHECK (cancellation_difficulty IN ('easy', 'medium', 'hard')),
  cancellation_url TEXT,
  support_email TEXT,
  support_phone TEXT,
  notes TEXT,
  plaid_transaction_id UUID,
  detected_by_ai BOOLEAN DEFAULT false,
  reminder_days_before INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON subscriptions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_category_id ON subscriptions(category_id);

-- =====================================================
-- 4. PLAID ACCOUNTS TABLE
-- =====================================================
CREATE TABLE plaid_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plaid_access_token TEXT NOT NULL,
  plaid_item_id TEXT NOT NULL,
  plaid_account_id TEXT NOT NULL,
  institution_name TEXT,
  account_name TEXT,
  account_type TEXT,
  account_subtype TEXT,
  mask TEXT,
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plaid accounts"
  ON plaid_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plaid accounts"
  ON plaid_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plaid accounts"
  ON plaid_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plaid accounts"
  ON plaid_accounts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_plaid_accounts_user_id ON plaid_accounts(user_id);
CREATE INDEX idx_plaid_accounts_item_id ON plaid_accounts(plaid_item_id);

-- =====================================================
-- 5. PLAID TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE plaid_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plaid_account_id UUID REFERENCES plaid_accounts(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  merchant_name TEXT,
  category TEXT[],
  is_recurring BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3,2),
  linked_subscription_id UUID REFERENCES subscriptions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plaid_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON plaid_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_plaid_transactions_user_id ON plaid_transactions(user_id);
CREATE INDEX idx_plaid_transactions_date ON plaid_transactions(date);
CREATE INDEX idx_plaid_transactions_is_recurring ON plaid_transactions(is_recurring);

-- =====================================================
-- 6. DETECTED SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE detected_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES plaid_transactions(id),
  name TEXT NOT NULL,
  estimated_amount DECIMAL(10,2) NOT NULL,
  estimated_frequency TEXT,
  confidence_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ignored')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE detected_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own detected subscriptions"
  ON detected_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own detected subscriptions"
  ON detected_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_detected_subscriptions_user_id ON detected_subscriptions(user_id);
CREATE INDEX idx_detected_subscriptions_status ON detected_subscriptions(status);

-- =====================================================
-- 7. SUBSCRIPTION ALERTS TABLE
-- =====================================================
CREATE TABLE subscription_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('renewal_reminder', 'price_change', 'cancellation_deadline', 'unused_service', 'payment_failed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  action_label TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON subscription_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON subscription_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON subscription_alerts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_subscription_alerts_user_id ON subscription_alerts(user_id);
CREATE INDEX idx_subscription_alerts_is_read ON subscription_alerts(is_read);
CREATE INDEX idx_subscription_alerts_created_at ON subscription_alerts(created_at DESC);

-- =====================================================
-- 8. CANCELLATION REQUESTS TABLE
-- =====================================================
CREATE TABLE cancellation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  method TEXT CHECK (method IN ('email', 'phone', 'chat', 'web_form', 'app')),
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  notes TEXT,
  confirmation_number TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cancellation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cancellation requests"
  ON cancellation_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cancellation requests"
  ON cancellation_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cancellation requests"
  ON cancellation_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_cancellation_requests_user_id ON cancellation_requests(user_id);
CREATE INDEX idx_cancellation_requests_status ON cancellation_requests(status);
CREATE INDEX idx_cancellation_requests_subscription_id ON cancellation_requests(subscription_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_monthly_spending(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN billing_cycle = 'monthly' THEN amount
      WHEN billing_cycle = 'yearly' THEN amount / 12
      WHEN billing_cycle = 'quarterly' THEN amount / 3
      WHEN billing_cycle = 'weekly' THEN amount * 4.33
      WHEN billing_cycle = 'daily' THEN amount * 30
      ELSE amount
    END
  ), 0) INTO total
  FROM subscriptions
  WHERE user_id = user_uuid AND status = 'active';
  
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plaid_accounts_updated_at
  BEFORE UPDATE ON plaid_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTH TRIGGER - Auto-create customer on signup
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup completed successfully!';
  RAISE NOTICE '✅ Created 8 tables with RLS policies';
  RAISE NOTICE '✅ Created 14 subscription categories';
  RAISE NOTICE '✅ Created helper functions and triggers';
  RAISE NOTICE '✅ Ready to use!';
END $$;
