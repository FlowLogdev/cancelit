-- Create plaid_items table to store Plaid access tokens and item information
CREATE TABLE IF NOT EXISTS plaid_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    institution_id TEXT,
    institution_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plaid_accounts table to store account information
CREATE TABLE IF NOT EXISTS plaid_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES plaid_items(item_id) ON DELETE CASCADE,
    account_id TEXT NOT NULL UNIQUE,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    account_subtype TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create detected_subscriptions table to store AI-detected subscriptions before import
CREATE TABLE IF NOT EXISTS detected_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant_name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    last_payment_date DATE NOT NULL,
    account_id TEXT NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'imported', 'ignored')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, merchant_name, amount)
);

-- Enable Row Level Security (RLS)
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own plaid items" ON plaid_items
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own plaid accounts" ON plaid_accounts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own detected subscriptions" ON detected_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON plaid_items TO authenticated;
GRANT ALL ON plaid_accounts TO authenticated;
GRANT ALL ON detected_subscriptions TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plaid_items_user_id ON plaid_items(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_user_id ON plaid_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_item_id ON plaid_accounts(item_id);
CREATE INDEX IF NOT EXISTS idx_plaid_accounts_account_id ON plaid_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_detected_subscriptions_user_id ON detected_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_detected_subscriptions_status ON detected_subscriptions(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_plaid_items_updated_at BEFORE UPDATE ON plaid_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plaid_accounts_updated_at BEFORE UPDATE ON plaid_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detected_subscriptions_updated_at BEFORE UPDATE ON detected_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
