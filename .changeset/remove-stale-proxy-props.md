---
"@paypal/react-paypal-js": patch
---

Remove properties from `useProxyProps` when a later render omits them, preventing removed callbacks and options from remaining visible to SDK integrations.
