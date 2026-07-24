---
"@paypal/react-paypal-js": minor
---

Add a generic, registry-driven React wrapper for all 50 v6 Local Payment Methods (LPM), exposed via the `@paypal/react-paypal-js/sdk-v6/local-payment-methods` subpath so the default `@paypal/react-paypal-js` export is unaffected.

Three usage patterns are supported:

```tsx
// All-in-one named button
import { BancontactOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
<BancontactOneTimePaymentButton
  presentationMode="popup"
  createOrder={createOrder}
  onApprove={onApprove}
/>;

// Split layout: named hook + standalone button
import {
  useBancontactOneTimePaymentSession,
  BancontactPaymentButton,
} from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
const bancontactSession = useBancontactOneTimePaymentSession({
  createOrder,
  onApprove,
});
<BancontactPaymentButton paymentSession={bancontactSession} type="pay" />;

// Generic, dynamic LPM selection
import { LPMOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6/local-payment-methods";
<LPMOneTimePaymentButton
  lpm={selectedLPM}
  createOrder={createOrder}
  onApprove={onApprove}
/>;
```

The subpath also re-exports `PayPalProvider`, `usePayPal`, and `INSTANCE_LOADING_STATE` so LPM consumers can obtain the provider from the same bundle their buttons/hooks come from.
