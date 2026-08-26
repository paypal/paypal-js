---
"@paypal/paypal-js": patch
---

Make `onApprove` genuinely optional on `PayPalOneTimePaymentSessionOptions` (and its `PayLaterOneTimePaymentSessionOptions` / `PayPalCreditOneTimePaymentSessionOptions` aliases).

The type intersected `BasePaymentSessionOptions` — where `onApprove` is required — and re-declared `onApprove?` without `Omit`-ing it from the base first. In a TypeScript intersection a property is optional only if it is optional in every constituent, so the `?` had no effect and `onApprove` was required in practice ([#1020](https://github.com/paypal/paypal-js/issues/1020)). Because the presentation mode is only chosen later at `.start()` (a separate call) and redirect flows legitimately have no in-page approval callback, core cannot require `onApprove`. It is now re-added as optional via `Omit<BasePaymentSessionOptions, "onApprove">`, mirroring `SavePaymentSessionOptions`.
