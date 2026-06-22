---
"@paypal/react-paypal-js": minor
---

Add `BraintreePayPalPayLaterButton`, a prebuilt v6 button that renders
`<paypal-pay-later-button>` and drives the Braintree PayPal Pay Later (BNPL) flow via
`useBraintreePayPalPayLaterSession`, sourcing `countryCode`/`productCode` from provider
eligibility.

Docs: clarify that the Pay Later and Credit buttons require eligibility to be fetched first —
via `useEligibleMethods` (client) or `useFetchEligibleMethods` (server) — with updated JSDoc
and README examples.
