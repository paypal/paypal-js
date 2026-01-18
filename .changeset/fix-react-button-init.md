---
"@paypal/react-paypal-js": patch
---

Fix React button initialization by properly handling the case where `initActions.enable()` returns void synchronously instead of a Promise.
