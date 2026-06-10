# Complete Stripe Setup Guide for CancelIt

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Sign in to your Stripe account (or create one)
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...` - click "Reveal test key" to see it)

## Step 2: Create Your Three Products in Stripe

### Create Product 1: Minimum Plan ($7.99/month)

1. Go to https://dashboard.stripe.com/test/products
2. Click **"Add product"**
3. Fill in the details:
   - **Name:** CancelIt Minimum
   - **Description:** Great for individuals who want better control
   - **Pricing model:** Standard pricing
   - **Price:** 7.99
   - **Currency:** USD
   - **Billing period:** Monthly (Recurring)
4. Click **"Save product"**
5. On the product page, find the **Price** section
6. Copy the **Price ID** (it starts with `price_...`)
7. Save this for `NEXT_PUBLIC_STRIPE_PRICE_MINIMUM`

### Create Product 2: Medium Plan ($9.99/month)

1. Click **"Add product"** again
2. Fill in:
   - **Name:** CancelIt Medium
   - **Description:** Perfect for power users and small families
   - **Pricing model:** Standard pricing
   - **Price:** 9.99
   - **Currency:** USD
   - **Billing period:** Monthly (Recurring)
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_...`)
5. Save this for `NEXT_PUBLIC_STRIPE_PRICE_MEDIUM`

### Create Product 3: Maximum Plan ($11.99/month)

1. Click **"Add product"** again
2. Fill in:
   - **Name:** CancelIt Maximum
   - **Description:** For users who want all premium features
   - **Pricing model:** Standard pricing
   - **Price:** 11.99
   - **Currency:** USD
   - **Billing period:** Monthly (Recurring)
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_...`)
5. Save this for `NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM`

## Step 3: Update Your .env.local File

Open your `.env.local` file and replace these values:

\`\`\`bash
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE

# Replace with your actual Price IDs
NEXT_PUBLIC_STRIPE_PRICE_MINIMUM=price_YOUR_MINIMUM_PRICE_ID_HERE
NEXT_PUBLIC_STRIPE_PRICE_MEDIUM=price_YOUR_MEDIUM_PRICE_ID_HERE
NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM=price_YOUR_MAXIMUM_PRICE_ID_HERE
\`\`\`

## Step 4: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Click on your **CancelIt** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable one by one:

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PRICE_MINIMUM` | `price_...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PRICE_MEDIUM` | `price_...` | Production, Preview, Development |
| `NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM` | `price_...` | Production, Preview, Development |

5. Click **"Save"** after each variable

## Step 5: Redeploy Your Application

After adding the environment variables in Vercel:

1. Go to **Deployments** tab
2. Click the **three dots (...)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for the deployment to complete

## Step 6: Test Your Integration

### Test Locally:
```powershell
cd C:\Users\fabio\Documents\lustmia
npm run dev
