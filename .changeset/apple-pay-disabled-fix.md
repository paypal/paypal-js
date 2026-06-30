---
"@paypal/react-paypal-js": patch
---

Fix `disabled` on `ApplePayOneTimePaymentButton`: apply the disabled state (dimming + click gating) on the wrapper instead of writing `disabled` to Apple's `<apple-pay-button>`, which ignores the attribute and manages it internally.
