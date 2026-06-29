# Stripe setup for CancelIt

CancelIt has one free tier handled inside the app and three paid Stripe subscription tiers.

## Paid tiers

| CancelIt tier | Stripe product name | Price | Billing |
| --- | --- | ---: | --- |
| Minimum | CancelIt Minimum | $4.99 | Monthly recurring |
| Medium | CancelIt Medium | $9.99 | Monthly recurring |
| Maximum | CancelIt Maximum | $19.99 | Monthly recurring |

## 1. Get API keys

In Stripe, open **Developers -> API keys**.

Copy:

- Publishable key: starts with `pk_test_` or `pk_live_`
- Secret key: starts with `sk_test_` or `sk_live_`

Use test keys while testing. Use live keys only when you are ready to charge real customers.

## 2. Create products and monthly prices

In Stripe, open **Product catalog -> Create product**.

Create these three products:

### CancelIt Minimum

- Name: `CancelIt Minimum`
- Description: `Track up to 10 subscriptions with Plaid scan up to 10 matches.`
- Pricing model: `Standard pricing`
- Price: `4.99`
- Currency: `USD`
- Billing period: `Monthly`

Copy the generated Price ID. It starts with `price_`.

### CancelIt Medium

- Name: `CancelIt Medium`
- Description: `Track up to 50 subscriptions with savings assistant and cancellation guidance.`
- Pricing model: `Standard pricing`
- Price: `9.99`
- Currency: `USD`
- Billing period: `Monthly`

Copy the generated Price ID.

### CancelIt Maximum

- Name: `CancelIt Maximum`
- Description: `Unlimited subscription tracking with priority cancellation support.`
- Pricing model: `Standard pricing`
- Price: `19.99`
- Currency: `USD`
- Billing period: `Monthly`

Copy the generated Price ID.

## 3. Add environment variables

Local `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

NEXT_PUBLIC_STRIPE_PRICE_MINIMUM=price_YOUR_MINIMUM_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_MEDIUM=price_YOUR_MEDIUM_PRICE_ID
NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM=price_YOUR_MAXIMUM_PRICE_ID
```

For production, add the same keys in Vercel Project Settings -> Environment Variables.

Use live Stripe keys and live Price IDs for production.

## 4. Checkout flow

The pricing page sends the selected `price_...` ID to:

```text
/api/create-checkout-session
```

The API only accepts the three configured CancelIt price IDs and stores this metadata in Stripe:

```text
plan_id=minimum | medium | maximum
plan_name=Minimum | Medium | Maximum
userId=<supabase user id>
```

After payment, Stripe redirects to:

```text
/payment/success?session_id={CHECKOUT_SESSION_ID}
```

That page calls:

```text
/api/verify-payment-session
```

and updates `customers.subscription_tier` in Supabase.

## 5. Recommended next step

Add a Stripe webhook later so renewals, failed payments, and cancellations update Supabase automatically. Checkout success verification is enough to start testing the first purchase flow.
