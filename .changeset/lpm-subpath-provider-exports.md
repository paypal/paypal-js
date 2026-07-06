---
"@paypal/react-paypal-js": minor
---

Local payment methods (LPM) are shipped as a separate `@paypal/react-paypal-js/sdk-v6/local-payment-methods` bundle with its own React context instance. Previously a `PayPalProvider` imported from `@paypal/react-paypal-js/sdk-v6` could not satisfy the LPM hooks' `usePayPal`, throwing `usePayPal must be used within a PayPalProvider`.

The LPM subpath now re-exports `PayPalProvider`, `usePayPal`, and `INSTANCE_LOADING_STATE` so LPM consumers can obtain the provider from the same bundle their buttons/hooks come from:

```tsx
import {
  PayPalProvider,
  IdealOneTimePaymentButton,
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
```

Additionally, each entry in `LPM_REGISTRY` now carries a `testBuyerCountry` (ISO 3166 alpha-2) so sandbox/testing integrations can set the buyer country the LPM session creators require.

The rendered payment fields can now be prefilled with initial values (mapping to the SDK `createPaymentFields({ value })` option):

- `LPMOneTimePaymentButton` (and the named `*OneTimePaymentButton` components) accept a `fieldValues` prop, e.g. `fieldValues={{ name: "John Doe", email: "john@example.com" }}`.
- The field components returned by the `use*OneTimePaymentSession` hooks accept a `value` prop.
