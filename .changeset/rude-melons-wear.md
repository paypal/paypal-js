---
"@paypal/react-paypal-js": patch
---

- Default `PayPalProvider` `components` to `["paypal-payments"]`.
- Update session hooks to check `loadingStatus` before returning an error for no `sdkInstance`.
- `PayPalContext` export was removed since merchants won't need to use that directly.
- Check only `window` for `isServer` SSR function.
