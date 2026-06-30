---
"@paypal/react-paypal-js": patch
---

`ApplePayOneTimePaymentButton` no longer writes a `disabled` attribute to Apple's `<apple-pay-button>`, which ignored it and manages its own enabled/disabled state internally via `canMakePayments()`. The non-functional `disabled` prop has been removed — merchants control presentation themselves.
