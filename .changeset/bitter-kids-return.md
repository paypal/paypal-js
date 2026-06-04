---
"@paypal/react-paypal-js": major
---

**BREAKING:** The v6 `environment` option is now required in the `PayPalProvider`. Previously, omitting `environment` silently defaulted to sandbox, which could cause production builds to load the sandbox SDK with a live `clientId`. Pass `environment: "production"` or `environment: "sandbox"` explicitly. TypeScript users will see a compile error; runtime callers will see a thrown `Error`.

### v6 PayPalProvider

Update the PayPalProvider to pass the environment property

```
<PayPalProvider
  clientId={clientId}
  environment="sandbox" // "production"
  components={["paypal-payments",]}
  pageType="checkout"
>
  <CheckoutPage />
</PayPalProvider>
```
