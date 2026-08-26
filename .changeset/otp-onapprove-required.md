---
"@paypal/paypal-js": patch
---

Fix misleading optional `onApprove` in `PayPalOneTimePaymentSessionOptions` (and its `PayLaterOneTimePaymentSessionOptions` / `PayPalCreditOneTimePaymentSessionOptions` aliases).

The type intersected `BasePaymentSessionOptions` — where `onApprove` is required — and re-declared `onApprove?` without `Omit`-ing it from the base first. In a TypeScript intersection a property is optional only if it is optional in every constituent, so the `?` had no effect and `onApprove` was already required in practice ([#1020](https://github.com/paypal/paypal-js/issues/1020)). The redundant declaration has been removed so the source honestly reflects that `onApprove` is required for one-time PayPal payments. The effective type is unchanged, so no previously-compiling code is affected.
