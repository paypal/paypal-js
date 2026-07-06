---
"@paypal/react-paypal-js": minor
---

Add the remaining 16 local payment methods to the `@paypal/react-paypal-js/sdk-v6/local-payment-methods` bundle, bringing the total to 50. The new LPMs are: Klarna, Afterpay, OXXO, Boleto Bancário, Paysafecard, Scalapay, Crypto, Dragonpay, FPX, Indomaret, Thailand Banks, Alfamart, Zip, Latvia Banks, FIUU, and Lithuania Banks.

Each new LPM is registry-driven like the existing ones and ships the same three exports plus prop-type aliases, e.g. for Klarna:

```tsx
import {
  KlarnaOneTimePaymentButton,
  useKlarnaOneTimePaymentSession,
  KlarnaPaymentButton,
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
```

Note: FIUU's SDK component is `fiuu-cash-payments` but its registered custom-element button tag is `fiuu-button` (it does not follow the standard component→tag derivation).
