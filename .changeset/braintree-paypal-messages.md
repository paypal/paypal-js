---
"@paypal/react-paypal-js": minor
---

Add `useBraintreePayPalMessages`, a v6 hook for rendering PayPal promotional / BNPL messaging (`<paypal-message>`) via Braintree.

- Wraps `BraintreePayPalCheckoutInstance.createMessages` on the shared instance from `useBraintreePayPal`. Because Braintree's `createMessages` is asynchronous (unlike the PayPal SDK's synchronous `createPayPalMessages`), the instance is created in an effect that awaits the Promise and guards against unmount / instance change before storing it.
- Returns `error`, `isReady`, `isLoading`, and `handleFetchContent(options)`, which fetches message content for a `<paypal-message>` element and resolves to a content object exposing `update({ amount })` so the displayed amount can change without re-fetching.
- Provider-level failures are surfaced separately and labeled (`Braintree PayPal context error: …`), distinct from instance/fetch errors, so consumers can tell which layer failed.
- Adds `BraintreeMessagesOptions`, `BraintreeMessagesInstance`, `BraintreeMessageContent`, and `BraintreeFetchMessageContentOptions` types, plus `createMessages` on `BraintreePayPalCheckoutInstance`.
