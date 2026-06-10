---
"@paypal/react-paypal-js": minor
---

Add Braintree PayPal Pay Later (BNPL) support and a companion eligibility hook for v6.

- `useBraintreePayPalPayLaterSession` — manages a Pay Later session (`error`, `isPending`, `handleClick`), consistent with the existing one-time-payment, billing-agreement, and checkout-with-vault hooks.
- `useBraintreeEligibleMethods` — fetches eligibility via `findEligibleMethods` and caches it on the provider, deduplicating by checkout instance + options and refetching when either changes.
- Provider-level failures are now surfaced separately and labeled (`Braintree provider error: …`, with the original error as `cause`), distinct from "checkout instance not available", so consumers can tell which layer failed.
- Add `shippingCallbackUrl`, `shippingAddressOverride` (now typed as `BraintreeShippingAddressOverride` instead of `Record<string, unknown>`), and `contactPreference` options to the one-time, Pay Later, and checkout-with-vault session types.
- `BraintreeEligibilityResult.getDetails` is now strongly typed per funding source.
