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
- XcodeGen project definition with Supabase Swift and Plaid LinkKit SPM dependencies.

## Setup

1. Install Xcode 16.1+ and XcodeGen on macOS.
2. Fill in `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `Config.xcconfig`.
4. Run:

```sh
cd ios/CancelIt
xcodegen generate
open CancelIt.xcodeproj
```

## Notes

- Plaid LinkKit 7 is configured through Swift Package Manager. The runtime flow expects a mobile-safe link token from the web backend.
- Supabase OAuth/deep links should call `supabase.auth.handle(url)` from `CancelItApp`.
- The current backend creates Plaid link tokens with web OAuth redirect URIs. For a production App Store build, add an iOS-specific redirect URI and Associated Domains.
- Stripe billing opens the hosted checkout URL in Safari. Review App Store requirements before shipping paid digital features; Apple In-App Purchase may be required depending on final positioning.
