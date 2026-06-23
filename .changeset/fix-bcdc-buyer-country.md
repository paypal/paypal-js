---
"@paypal/react-paypal-js": patch
---

Fix the BCDC guest button so `buyerCountry` is reliably passed to the underlying `<paypal-basic-card-button>` on all supported React versions. `usePayPalGuestPaymentSession` / `PayPalGuestPaymentButton` now accept a `buyerCountry` option and apply it via the element's DOM property (a camelCase JSX prop is lowercased to `buyercountry` on React <19 and misses the element's `buyer-country` attribute). The `paypal-basic-card-button` JSX type now exposes the `buyer-country` attribute accordingly.
