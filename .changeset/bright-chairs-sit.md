---
"@paypal/paypal-js": patch
---

Suppress unload event listener registration while the PayPal SDK script is loading, and restore the original behavior after the load completes or fails.
