---
"@paypal/paypal-js": minor
---

Add TypeScript types for the v6 local payment methods (LPM) components. `LPMPaymentsInstance` and the `LPMComponents` union are now exported from `@paypal/paypal-js/sdk-v6`, and `SdkInstance`/`Components`/`CreateInstanceOptions` recognize LPM component names (e.g. `"ideal-payments"`, `"bancontact-payments"`) so `createInstance` returns the LPM methods when an LPM component is requested.
