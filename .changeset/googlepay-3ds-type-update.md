---
"@paypal/paypal-js": minor
---

Update the v6 Google Pay types for 3D Secure (SCA) support.

`GooglePayOneTimePaymentSession.initiatePayerAction` changes from the previous no-op
placeholder to its real signature — `initiatePayerAction(options: { orderId: string }):
Promise<InitiatePayerActionResponse>` — which resolves with the 3DS `liabilityShift` and
rejects if the buyer cancels or authentication fails.

Adds and exports three supporting types: `LiabilityShiftType`
(`"UNKNOWN" | "NO" | "YES" | "POSSIBLE"`), `InitiatePayerActionOptions`, and
`InitiatePayerActionResponse`.
