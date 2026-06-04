---
"@paypal/paypal-js": major
---

**BREAKING:** The v6 `environment` option is now required on `loadCoreSdkScript`. Previously, omitting `environment` silently defaulted to sandbox, which could cause production builds to load the sandbox SDK with a live `clientId`. Pass `environment: "production"` or `environment: "sandbox"` explicitly. TypeScript users will see a compile error; runtime callers will see a thrown `Error`.

### v6 loadCoreSdkScript

Update usage of loadCoreSdkScript to pass the environment property correctly

```
const paypalGlobalNamespace = await loadCoreSdkScript({
  environment: "sandbox", // "production"
});
```
