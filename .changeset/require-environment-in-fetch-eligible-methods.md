---
"@paypal/react-paypal-js": patch
---

Fix: `useFetchEligibleMethods` now requires the `environment` option, matching the `loadCoreSdkScript` / `PayPalProvider` change in v10.0.0. Previously, omitting `environment` silently fell through to the sandbox eligibility API (`https://api-m.sandbox.paypal.com`), which could cause a production server-rendered checkout to hydrate `PayPalProvider` with sandbox eligibility data while the client loaded the production SDK — surfacing as missing or incorrect payment buttons. TypeScript users will now see a compile error if `environment` is omitted; runtime callers will see a thrown `Error`. Pass `environment: "production"` or `environment: "sandbox"` explicitly.

```ts
// Before (silently used sandbox)
const response = await useFetchEligibleMethods({ headers, payload });

// After (required)
const response = await useFetchEligibleMethods({
  environment: "production", // or "sandbox"
  headers,
  payload,
});
```
