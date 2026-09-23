# CancelIt iOS

Native SwiftUI shell for CancelIt, designed to reuse the production web backend at `https://cancelit.app`.

## What is included

- Email/password auth through Supabase Swift.
- Dark native dashboard matching the black/red CancelIt direction.
- Dashboard, subscription list/detail, Plaid connection, import review, AI assistant, analytics, alerts, pricing, and settings screens.
- Thin API client for the existing Next.js endpoints:
  - `/api/plaid/create-link-token`
  - `/api/plaid/exchange-token`
  - `/api/plaid/accounts`
  - `/api/plaid/get-subscriptions`
  - `/api/plaid/import-subscriptions`
  - `/api/cancellation-requests`
  - `/api/ai-chat`
  - `/api/create-checkout-session`
  - `/api/customers`
- XcodeGen project definition with Supabase Swift, Plaid LinkKit, and RevenueCat SPM dependencies.

## Setup

1. Install Xcode 16.1+ and XcodeGen on macOS.
2. Fill in `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and the public iOS RevenueCat SDK key in `Config.xcconfig`.
3. In RevenueCat, create the `minimum`, `medium`, and `maximum` entitlements; attach the matching App Store subscriptions; and add packages named `starter`, `plus`, and `unlimited` to the current offering.
4. Set the RevenueCat webhook to `https://cancelit.app/api/revenuecat/webhook` and configure the same authorization secret in Vercel as `REVENUECAT_WEBHOOK_AUTHORIZATION`.
5. Add the RevenueCat product IDs in Vercel as `REVENUECAT_PRODUCT_MINIMUM`, `REVENUECAT_PRODUCT_MEDIUM`, and `REVENUECAT_PRODUCT_MAXIMUM` so the web backend applies the correct CancelIt plan limits.
6. Run:

```sh
cd ios/CancelIt
xcodegen generate
open CancelIt.xcodeproj
```

## Notes

- Plaid LinkKit 7 is configured through Swift Package Manager. The runtime flow expects a mobile-safe link token from the web backend.
- Supabase OAuth/deep links should call `supabase.auth.handle(url)` from `CancelItApp`.
- The current backend creates Plaid link tokens with web OAuth redirect URIs. For a production App Store build, add an iOS-specific redirect URI and Associated Domains.
- RevenueCat identifies customers using their Supabase user UUID. Its webhook is the source of truth for applying entitlements to the shared backend, including Plaid limits.
