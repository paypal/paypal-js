---
"@paypal/react-paypal-js": minor
---

Add a React wrapper for all 50 v6 SDK Local Payment Methods (LPM), shipped via a new `@paypal/react-paypal-js/sdk-v6/local-payment-methods` subpath so the default `@paypal/react-paypal-js` export is unaffected.

Each LPM ships three usage patterns:

```tsx
import {
  PayPalProvider,
  IdealOneTimePaymentButton,
  useIdealOneTimePaymentSession,
  IdealPaymentButton,
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
```

- An all-in-one named button, e.g. `IdealOneTimePaymentButton`.
- A split hook + standalone button, e.g. `useIdealOneTimePaymentSession` + `IdealPaymentButton`.
- A generic dynamic-selector button, `LPMOneTimePaymentButton`.

The LPM subpath is a separate bundle with its own React context instance, so it re-exports `PayPalProvider`, `usePayPal`, and `INSTANCE_LOADING_STATE` — LPM consumers should obtain the provider from this subpath rather than `@paypal/react-paypal-js/sdk-v6` to ensure their `PayPalProvider` and LPM hooks/buttons share the same context.

The rendered payment fields can be prefilled with initial values (mapping to the SDK `createPaymentFields({ value })` option):

- `LPMOneTimePaymentButton` (and the named `*OneTimePaymentButton` components) accept a `fieldValues` prop, e.g. `fieldValues={{ name: "John Doe", email: "john@example.com" }}`.
- The field components returned by the `use*OneTimePaymentSession` hooks accept a `value` prop.

Each entry in `LPM_REGISTRY` also carries a `testBuyerCountry` (ISO 3166 alpha-2) so sandbox/testing integrations can set the buyer country the LPM session creators require.
