# Stripe Setup Guide for CancelIt App

Follow these steps to configure Stripe payments for your CancelIt app.

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Sign in to your Stripe account (or create one if needed)
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`) - Copy this
   - **Secret key** - Click "Reveal test key" and copy it (starts with `sk_test_`)

## Step 2: Create Three Products in Stripe

Go to https://dashboard.stripe.com/test/products and create these three products:

### Product 1: Minimum Plan
1. Click **"Add product"**
2. Fill in:
   - **Name:** CancelIt Minimum
   - **Description:** Great for individuals who want better control
   - **Pricing:** $7.99
   - **Billing period:** Monthly (recurring)
3. Click **"Save product"**
4. Copy the **Price ID** (it starts with `price_` and looks like `price_1AbCd123...`)

### Product 2: Medium Plan
1. Click **"Add product"**
2. Fill in:
   - **Name:** CancelIt Medium
   - **Description:** Perfect for power users and small families
   - **Pricing:** $9.99
   - **Billing period:** Monthly (recurring)
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_`)

### Product 3: Maximum Plan
1. Click **"Add product"**
2. Fill in:
   - **Name:** CancelIt Maximum
   - **Description:** For users who want all premium features
   - **Pricing:** $11.99
   - **Billing period:** Monthly (recurring)
3. Click **"Save product"**
4. Copy the **Price ID** (starts with `price_`)

## Step 3: Update Your .env.local File

Open your `.env.local` file and replace these values with your actual Stripe keys:

\`\`\`bash
# Replace these with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY_HERE

# Replace these with your actual Price IDs from Stripe
NEXT_PUBLIC_STRIPE_PRICE_MINIMUM=price_YOUR_MINIMUM_PRICE_ID_HERE
NEXT_PUBLIC_STRIPE_PRICE_MEDIUM=price_YOUR_MEDIUM_PRICE_ID_HERE
NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM=price_YOUR_MAXIMUM_PRICE_ID_HERE
\`\`\`

## Step 4: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select your CancelIt project
3. Go to **Settings** → **Environment Variables**
4. Add these 5 variables one by one:
   - `STRIPE_SECRET_KEY` → Your secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → Your publishable key
   - `NEXT_PUBLIC_STRIPE_PRICE_MINIMUM` → Minimum plan price ID
   - `NEXT_PUBLIC_STRIPE_PRICE_MEDIUM` → Medium plan price ID
   - `NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM` → Maximum plan price ID
5. Make sure to add them for all environments (Production, Preview, Development)
6. Click **"Save"**
7. Redeploy your app

## Step 5: Test Your Setup

### Test Locally:
\`\`\`bash
cd C:\Users\fabio\Documents\lustmia
npm run dev
\`\`\`

Visit: http://localhost:3000/pricing

### Test on Vercel:
Visit your deployed app at: https://your-app.vercel.app/pricing

### Use Stripe Test Cards:

When testing checkout, use these test card numbers:

- **Successful payment:** `4242 4242 4242 4242`
- **Payment declined:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`

For all test cards:
- **Expiry:** Any future date (e.g., 12/34)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

## Troubleshooting

### "No checkout URL received"
- Verify all three Price IDs are correct in Stripe Dashboard
- Check that all environment variables are set in Vercel
- Redeploy your app after adding variables

### "Invalid API Key"
- Make sure you're using TEST mode keys (starting with `sk_test_` and `pk_test_`)
- Check for extra spaces when copying the keys
- Verify the keys are from the same Stripe account

### "Price not found"
- Go to Stripe Dashboard → Products
- Click on your product
- Make sure you copied the **Price ID** (not Product ID)
- Price ID starts with `price_`, Product ID starts with `prod_`

### Payments not working on Vercel but work locally
- Check that all 5 Stripe environment variables are added to Vercel
- Redeploy after adding variables
- Check the deployment logs for any errors

## Going Live (When Ready)

When you're ready to accept real payments:

1. In Stripe Dashboard, toggle from **Test Mode** to **Live Mode** (top right)
2. Get your **live** API keys from https://dashboard.stripe.com/apikeys
   - They will start with `sk_live_` and `pk_live_`
3. Create your three products again in **live mode**
4. Get the new live Price IDs
5. Update all environment variables with live keys
6. Redeploy

**Important:** Never mix test and live keys! Always use matching keys and Price IDs.

## Summary Checklist

- [ ] Created Stripe account
- [ ] Got test API keys (sk_test_ and pk_test_)
- [ ] Created Minimum plan product ($7.99)
- [ ] Created Medium plan product ($9.99)
- [ ] Created Maximum plan product ($11.99)
- [ ] Copied all three Price IDs
- [ ] Updated .env.local with all 5 Stripe variables
- [ ] Added all 5 variables to Vercel
- [ ] Redeployed the app
- [ ] Tested checkout with test card 4242 4242 4242 4242
- [ ] Verified payment flow works end-to-end

## Support

If you need help:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test your integration: https://dashboard.stripe.com/test/payments
