# Plaid Integration Setup Guide

This guide will help you set up Plaid integration for CancelIt to enable automatic subscription detection from bank transactions.

## Prerequisites

- Supabase project set up
- Vercel account (for deployment)
- Plaid account (free for development)

## Step 1: Get Plaid Credentials

1. Sign up for a free Plaid account at [dashboard.plaid.com/signup](https://dashboard.plaid.com/signup)
2. Navigate to **Team Settings** → **Keys**
3. Copy your:
   - `client_id`
   - `sandbox` secret (for development)
   - `development` secret (for staging)
   - `production` secret (when ready for production)

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

\`\`\`bash
# Plaid Configuration
PLAID_CLIENT_ID=your_client_id_here
PLAID_SECRET=your_sandbox_secret_here
PLAID_ENV=production

# Optional: For webhooks and OAuth
PLAID_WEBHOOK_URL=https://www.cancelit.app/api/plaid/webhook
PLAID_REDIRECT_URI=https://www.cancelit.app/plaid/oauth
\`\`\`

### Environment Options:
- `sandbox` - Free, unlimited testing with fake credentials
- `development` - Test with real bank data (100 free Items)
- `production` - Live production environment (paid)

## Step 3: Install Dependencies

\`\`\`bash
pnpm install plaid react-plaid-link
\`\`\`

## Step 4: Set Up Database Tables

Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- Plaid items (bank connections)
CREATE TABLE IF NOT EXISTS plaid_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  status TEXT DEFAULT 'active',
  error JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plaid accounts
CREATE TABLE IF NOT EXISTS plaid_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT REFERENCES plaid_items(item_id) ON DELETE CASCADE,
  account_id TEXT UNIQUE NOT NULL,
  account_name TEXT,
  account_mask TEXT,
  account_type TEXT,
  account_subtype TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plaid_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own plaid items"
  ON plaid_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own plaid accounts"
  ON plaid_accounts FOR SELECT
  USING (auth.uid() = user_id);
\`\`\`

## Step 5: Test the Integration

### Using Sandbox Test Credentials

1. Start your dev server: `pnpm dev`
2. Navigate to the dashboard
3. Click "Connect Your Bank Account"
4. Select any bank from the list
5. Use these test credentials:
   - Username: `user_good`
   - Password: `pass_good`
   - MFA Code: `1234`

### Available Test Users

- `user_good` / `pass_good` - Successful connection
- `user_bad` / `pass_bad` - Invalid credentials error
- `user_locked` / `pass_locked` - Account locked error

## Step 6: Deploy to Vercel

1. Push your code to GitHub
2. In Vercel dashboard, add the environment variables:
   - `PLAID_CLIENT_ID`
   - `PLAID_SECRET`
   - `PLAID_ENV`
   - `PLAID_WEBHOOK_URL` (use your Vercel URL)
   - `PLAID_REDIRECT_URI` (use your Vercel URL)
3. Deploy!

## Troubleshooting

### "Invalid credentials" in Sandbox
- Make sure you're using exactly `user_good` / `pass_good`
- Check that `PLAID_ENV=sandbox` in your `.env.local`

### "Failed to create link token"
- Verify `PLAID_CLIENT_ID` and `PLAID_SECRET` are correct
- Check the server console for detailed error messages
- Ensure you're using the correct secret for your environment

### "Failed to exchange token"
- Check that `plaid_items` table exists in Supabase
- Verify RLS policies allow inserts
- Check server logs for detailed error

### Webhook not receiving events
- Plaid webhooks only work with public URLs (not localhost)
- For local testing, use ngrok or deploy to Vercel
- Verify webhook URL is registered in Plaid dashboard

## Production Checklist

Before going to production:

- [ ] Request production access from Plaid
- [ ] Switch to production credentials
- [ ] Update `PLAID_ENV=production`
- [ ] Add `https://www.cancelit.app/plaid/oauth` in Plaid Dashboard under Link redirect URIs
- [ ] Add `https://www.cancelit.app/api/plaid/webhook` as the Plaid webhook URL
- [ ] Set up proper webhook handling
- [ ] Implement transaction syncing
- [ ] Add error monitoring
- [ ] Test with real bank accounts

## Resources

- [Plaid Documentation](https://plaid.com/docs/)
- [Plaid Dashboard](https://dashboard.plaid.com/)
- [Plaid API Reference](https://plaid.com/docs/api/)
- [Plaid React Link](https://github.com/plaid/react-plaid-link)
