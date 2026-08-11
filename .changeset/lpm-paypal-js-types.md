---
"@paypal/paypal-js": minor
---

Add TypeScript types for the v6 local payment methods (LPM) components. `LPMPaymentsInstance` and the `LPMComponents` union are now exported from `@paypal/paypal-js/sdk-v6`, and `SdkInstance`/`Components`/`CreateInstanceOptions` recognize LPM component names (e.g. `"ideal-payments"`, `"bancontact-payments"`) so `createInstance` returns the LPM methods when an LPM component is requested.

`SdkInstance` now narrows the LPM methods it exposes to only the components actually requested — for example `createInstance({ components: ["ideal-payments"] })` now types `createIdealOneTimePaymentSession` only, instead of surfacing all 50 LPM session-creation methods as optional. This is powered by a new single-source-of-truth `LPMComponentToSessionMethod` map (also exported) and an `LPMInstanceFor<T>` helper type, which replace the previous positionally-aligned `LPMComponents`/`LPMSessionMethodName` unions.
