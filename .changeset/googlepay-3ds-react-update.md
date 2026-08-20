---
"@paypal/react-paypal-js": minor
---

Add 3D Secure (SCA) support to the Google Pay one-time payment hook and button.

When `confirmOrder` returns `PAYER_ACTION_REQUIRED`, `useGooglePayOneTimePaymentSession`
(and `GooglePayOneTimePaymentButton`) now launches the payer-action flow automatically. The
3DS modal runs after Google's payment sheet closes, and `onApprove` fires only once the
buyer completes authentication — so merchants never capture an unauthenticated order. The
`onApprove` data now carries the resulting `liabilityShift` (via the new
`GooglePayOnApproveData` type). A buyer cancel or authentication failure is reported through
`onError`.
