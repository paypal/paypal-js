---
"@paypal/react-paypal-js": patch
---

Correct the `PayPalOneTimePaymentButton` README example to include the required `onApprove` callback.

The example previously rendered `<PayPalOneTimePaymentButton orderId="ORDER-123" />` without `onApprove`, which does not type-check now that `onApprove` is correctly required for one-time PayPal payments ([#1020](https://github.com/paypal/paypal-js/issues/1020)).
