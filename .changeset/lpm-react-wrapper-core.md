---
"@paypal/react-paypal-js": minor
---

Add a React wrapper for all 50 v6 SDK Local Payment Methods (LPM) to the existing `@paypal/react-paypal-js/sdk-v6` entry. The legacy `@paypal/react-paypal-js` entry remains unaffected, while static named v6 imports allow compatible production bundlers to remove unused LPM exports.

Each LPM ships three usage patterns:

```tsx
import {
  PayPalProvider,
  IdealOneTimePaymentButton,
  useIdealOneTimePaymentSession,
  IdealPaymentButton,
} from "@paypal/react-paypal-js/sdk-v6";
```

- An all-in-one named button, e.g. `IdealOneTimePaymentButton`.
- A split hook + standalone button, e.g. `useIdealOneTimePaymentSession` + `IdealPaymentButton`.
- A generic dynamic-selector button, `LPMOneTimePaymentButton`.

PayPal and LPM components imported from `@paypal/react-paypal-js/sdk-v6` share the same `PayPalProvider`, React context, and SDK instance. LPM factory exports are annotated as side-effect free so unused payment methods can be tree-shaken from the single published client bundle.

The rendered payment fields can be prefilled with initial values (mapping to the SDK `createPaymentFields({ value })` option):

- `LPMOneTimePaymentButton` (and the named `*OneTimePaymentButton` components) accept a `fieldValues` prop, e.g. `fieldValues={{ name: "John Doe", email: "john@example.com" }}`.
- The field components returned by the `use*OneTimePaymentSession` hooks accept a `value` prop.

Each entry in `LPM_REGISTRY` also carries a `testBuyerCountry` (ISO 3166 alpha-2) so sandbox/testing integrations can set the buyer country the LPM session creators require.
